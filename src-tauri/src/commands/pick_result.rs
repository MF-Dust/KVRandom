use tauri::{AppHandle, Emitter, Manager};

use crate::audio::AudioCommand;
use crate::config::PickResultDialogConfig;
use crate::error::{AppError, AppResult};
use crate::models::{PickResultResetPayload, PickedStudent};
use crate::state::{refresh_config, AppState};
use crate::windows::{
    apply_floating_window_config, hide_floating_window, reset_and_hide_pick_result_window,
    show_floating_window, stop_pick_count_bgm,
};

fn state_locked() -> AppError {
    AppError::State("阿罗娜状态卡住了...请重试～".to_string())
}

#[tauri::command]
pub(crate) async fn get_pick_result_config(app: AppHandle) -> AppResult<PickResultDialogConfig> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<PickResultDialogConfig> {
        let state = app.state::<AppState>();
        let config = refresh_config(&app, &state)?;
        Ok(config.pick_result_dialog)
    })
    .await?
}

#[tauri::command]
pub(crate) async fn get_pick_results(app: AppHandle) -> AppResult<Vec<PickedStudent>> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<Vec<PickedStudent>> {
        let state = app.state::<AppState>();
        let results = state
            .inner
            .lock()
            .map_err(|_| state_locked())?
            .current_pick_results
            .clone();
        Ok(results)
    })
    .await?
}

#[tauri::command]
pub(crate) async fn close_pick_result(app: AppHandle) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<()> {
        let state = app.state::<AppState>();
        let (token, source, _play_bgm) = {
            let mut guard = state.inner.lock().map_err(|_| state_locked())?;
            guard.pick_result_token = guard.pick_result_token.saturating_add(1);
            guard.current_pick_results.clear();
            guard.floating_hidden_for_pick_count = false;
            let src = guard.draw_trigger_source.take();
            (
                guard.pick_result_token,
                src,
                guard.config.pick_count_dialog.default_play_music,
            )
        };
        reset_and_hide_pick_result_window(&app, token, "close");
        stop_pick_count_bgm(&app);

        if let Some(src) = source {
            if src == "recruit" {
                if let Some(window) = app.get_webview_window("recruit") {
                    let _ = window.emit(
                        "pick-result-reset",
                        PickResultResetPayload {
                            token,
                            reason: "close".to_string(),
                        },
                    );
                    {
                        let mut guard = state.inner.lock().map_err(|_| state_locked())?;
                        guard.floating_hidden_for_pick_count = true;
                    }
                    hide_floating_window(&app);
                    return Ok(());
                }
            }
        }

        show_floating_window(&app);
        Ok(())
    })
    .await?
}

#[tauri::command]
pub(crate) async fn open_recruit(app: AppHandle) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<()> {
        let state = app.state::<AppState>();
        let config = refresh_config(&app, &state)?;
        if let Some(window) = app.get_webview_window("floating") {
            apply_floating_window_config(&window, &config);
        }
        crate::windows::open_recruit_window(&app, &config)?;
        if config.pick_count_dialog.default_play_music {
            let _ = state.audio.send(AudioCommand::PlayBgm {
                paths: config.pick_count_dialog.bgm_paths.clone(),
                volume: config.pick_count_dialog.bgm_volume as f32,
            });
        }
        state
            .inner
            .lock()
            .map_err(|_| state_locked())?
            .floating_hidden_for_pick_count = true;
        hide_floating_window(&app);
        Ok(())
    })
    .await?
}

#[tauri::command]
pub(crate) async fn close_recruit(app: AppHandle) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<()> {
        let state = app.state::<AppState>();
        crate::windows::hide_recruit_window(&app);
        let _ = state.audio.send(AudioCommand::StopBgm);
        state
            .inner
            .lock()
            .map_err(|_| state_locked())?
            .floating_hidden_for_pick_count = false;
        show_floating_window(&app);
        Ok(())
    })
    .await?
}
