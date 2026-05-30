mod admin;
mod audio;
mod commands;
mod config;
mod error;
mod logging;
mod models;
mod picker;
mod state;
mod tray;
mod update;
mod utils;
mod windows;

use std::sync::Mutex;

use admin::{acquire_single_instance_guard, is_process_elevated, request_admin_relaunch};
use audio::{AudioCommand, AudioController};
use config::load_config_with_signature;
use logging::BufferLayer;
use state::{AppState, RuntimeState};
use tauri::Manager;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};
use tray::setup_tray;
use windows::{create_floating_window, persist_floating_position};

fn init_logging(app_handle: tauri::AppHandle) {
    let env_filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));
    let result = tracing_subscriber::registry()
        .with(env_filter)
        .with(BufferLayer::new(app_handle))
        .try_init();
    if let Err(err) = result {
        eprintln!("Failed to initialize tracing subscriber: {err}");
    }
}

pub fn run() {
    let single_instance_guard = match acquire_single_instance_guard() {
        Ok(Some(guard)) => guard,
        Ok(None) => return,
        Err(error) => {
            eprintln!("{error}");
            return;
        }
    };

    tauri::Builder::default()
        .setup(move |app| {
            let app_handle = app.handle().clone();
            let (initial_config, initial_config_signature) =
                load_config_with_signature(&app_handle).map_err(anyhow::Error::msg)?;
            let mut single_instance_guard = Some(single_instance_guard);

            if initial_config.web_config.admin_topmost_enabled
                && cfg!(target_os = "windows")
                && !cfg!(debug_assertions)
                && !is_process_elevated()
            {
                drop(single_instance_guard.take());
                let result = request_admin_relaunch();
                if result.ok {
                    app_handle.exit(0);
                    return Ok(());
                }

                single_instance_guard = match acquire_single_instance_guard() {
                    Ok(Some(guard)) => Some(guard),
                    Ok(None) => {
                        app_handle.exit(0);
                        return Ok(());
                    }
                    Err(error) => return Err(anyhow::Error::msg(error).into()),
                };
            }

            let single_instance_guard = single_instance_guard
                .take()
                .ok_or_else(|| anyhow::Error::msg("单实例锁还没初始化呢..."))?;
            app.manage(AppState {
                inner: Mutex::new(RuntimeState::new(
                    initial_config.clone(),
                    initial_config_signature,
                )),
                audio: AudioController::new(&app_handle),
                _single_instance_guard: single_instance_guard,
            });

            init_logging(app_handle.clone());

            setup_tray(&app_handle).map_err(anyhow::Error::msg)?;
            create_floating_window(&app_handle, &initial_config).map_err(anyhow::Error::msg)?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let label = window.label();
                if label == "floating" {
                    let app = window.app_handle();
                    if let Some(state) = app.try_state::<AppState>() {
                        persist_floating_position(app, &state);
                    }
                } else if label == "recruit" {
                    api.prevent_close();
                    let app = window.app_handle();
                    if let Some(state) = app.try_state::<AppState>() {
                        if let Ok(mut inner) = state.inner.lock() {
                            inner.floating_hidden_for_pick_count = false;
                        }
                        let _ = state.audio.send(AudioCommand::StopBgm);
                    }
                    windows::hide_recruit_window(app);
                    windows::show_floating_window(app);
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::floating::get_floating_button_config,
            commands::floating::floating_button_clicked,
            commands::floating::floating_button_drag_start,
            commands::floating::floating_button_drag_move,
            commands::floating::floating_button_drag_end,
            commands::floating::floating_button_set_ignore_mouse,
            commands::pick_dialog::get_pick_count_config,
            commands::pick_dialog::cancel_pick_count,
            commands::pick_dialog::confirm_pick_count,
            commands::pick_dialog::confirm_select_student,
            commands::audio::play_click_sound,
            commands::audio::play_bgm,
            commands::audio::stop_bgm,
            commands::audio::play_gacha_sound,
            commands::audio::stop_gacha_sound,
            commands::pick_result::get_pick_result_config,
            commands::pick_result::get_pick_results,
            commands::pick_result::close_pick_result,
            commands::pick_result::open_recruit,
            commands::pick_result::close_recruit,
            commands::config_cmd::open_config,
            commands::config_cmd::get_config,
            commands::config_cmd::get_system_fonts,
            commands::config_cmd::parse_student_list_text,
            commands::config_cmd::import_student_list_from_file,
            commands::config_cmd::save_app_config,
            commands::system::get_app_info,
            commands::system::check_update,
            commands::system::request_admin_elevation,
            commands::system::create_admin_startup_task,
            commands::log::renderer_log,
            commands::log::get_logs,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
