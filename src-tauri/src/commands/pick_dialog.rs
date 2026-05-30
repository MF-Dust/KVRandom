use tauri::{AppHandle, Emitter, Manager};

use crate::config::{PickCountDialogConfig, MAX_PICK_COUNT, MIN_PICK_COUNT};
use crate::error::{AppError, AppResult};
use crate::models::{PickResultOpenPayload, PickResultResetPayload, PickedStudent};
use crate::picker::{
    assign_rarity, build_weighted_pool, pick_students_with_repeat, pick_students_without_repeat,
};
use crate::state::{push_log, refresh_config, AppState};
use crate::utils::clamp_i32;
use crate::windows::{
    apply_floating_window_config, hide_floating_window, hide_pick_count_window,
    open_pick_count_window, open_pick_result_window, stop_pick_count_bgm,
};

fn state_locked() -> AppError {
    AppError::State("阿罗娜状态卡住了...请重试～".to_string())
}

#[tauri::command]
pub(crate) async fn get_pick_count_config(app: AppHandle) -> AppResult<PickCountDialogConfig> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<PickCountDialogConfig> {
        let state = app.state::<AppState>();
        let config = refresh_config(&app, &state)?;
        Ok(config.pick_count_dialog)
    })
    .await?
}

pub(crate) async fn open_pick_count(app: AppHandle) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<()> {
        let state = app.state::<AppState>();
        let config = refresh_config(&app, &state)?;
        if let Some(window) = app.get_webview_window("floating") {
            apply_floating_window_config(&window, &config);
        }
        open_pick_count_window(&app, &config.pick_count_dialog)?;
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
pub(crate) async fn cancel_pick_count(app: AppHandle) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<()> {
        let state = app.state::<AppState>();
        hide_pick_count_window(&app);
        stop_pick_count_bgm(&app);
        state
            .inner
            .lock()
            .map_err(|_| state_locked())?
            .floating_hidden_for_pick_count = false;
        crate::windows::show_floating_window(&app);
        Ok(())
    })
    .await?
}

#[tauri::command]
pub(crate) async fn confirm_pick_count(
    app: AppHandle,
    count: i32,
    play_music: bool,
    source: Option<String>,
) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<()> {
        let state = app.state::<AppState>();
        let selected_count = clamp_i32(count, MIN_PICK_COUNT, MAX_PICK_COUNT, MIN_PICK_COUNT);
        let config = refresh_config(&app, &state)?;
        push_log(
            &app,
            &state,
            "info",
            &format!("Pick count confirmed. count={selected_count}, playMusic={play_music}"),
        );
        if let Some(window) = app.get_webview_window("floating") {
            apply_floating_window_config(&window, &config);
        }
        let picked_students = {
            let mut guard = state.inner.lock().map_err(|_| state_locked())?;
            if guard.config.allow_repeat_draw {
                if guard.weighted_pool_cache.is_none() {
                    guard.weighted_pool_cache = Some(build_weighted_pool(&guard.config));
                }
                let mut pity = guard.pity_counter;
                let picked = pick_students_with_repeat(
                    guard.weighted_pool_cache.as_ref().unwrap(),
                    selected_count,
                    &guard.config.student_list,
                    &mut pity,
                );
                guard.pity_counter = pity;
                picked
            } else {
                let mut pity = guard.pity_counter;
                let picked = pick_students_without_repeat(&guard.config, selected_count, &mut pity);
                guard.pity_counter = pity;
                picked
            }
        };
        if !picked_students.is_empty() {
            let names = picked_students
                .iter()
                .map(|student| student.name.as_str())
                .collect::<Vec<_>>()
                .join(", ");
            push_log(&app, &state, "info", &format!("点名结果: {names}"));
        }

        hide_pick_count_window(&app);
        let is_recruit = source.as_deref() == Some("recruit");
        if !is_recruit {
            crate::windows::hide_recruit_window(&app);
        }

        let (token, config) = {
            let mut guard = state.inner.lock().map_err(|_| state_locked())?;
            guard.floating_hidden_for_pick_count = true;
            guard.current_pick_results = picked_students.clone();
            guard.pick_result_token = guard.pick_result_token.saturating_add(1);
            guard.draw_trigger_source = source;
            (
                guard.pick_result_token,
                guard.config.pick_result_dialog.clone(),
            )
        };

        if is_recruit {
            if let Some(window) = app.get_webview_window("recruit") {
                let _ = window.emit(
                    "pick-result-reset",
                    PickResultResetPayload {
                        token,
                        reason: "before-open".to_string(),
                    },
                );
                let _ = window.emit(
                    "pick-result-open",
                    PickResultOpenPayload {
                        token,
                        results: picked_students,
                        config,
                    },
                );
            }
            Ok(())
        } else {
            open_pick_result_window(&app, &state, picked_students)?;
            Ok(())
        }
    })
    .await?
}

#[tauri::command]
pub(crate) async fn confirm_select_student(
    app: AppHandle,
    student_name: String,
    source: Option<String>,
) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<()> {
        let state = app.state::<AppState>();
        let config = refresh_config(&app, &state)?;
        push_log(
            &app,
            &state,
            "info",
            &format!("Select student confirmed. student_name={student_name}"),
        );
        if let Some(window) = app.get_webview_window("floating") {
            apply_floating_window_config(&window, &config);
        }

        let picked_student = {
            let mut guard = state.inner.lock().map_err(|_| state_locked())?;
            let mut pity = guard.pity_counter;
            let rarity = assign_rarity(&mut pity);
            guard.pity_counter = pity;

            let name = student_name.trim();
            let student = config.student_list.iter().find(|s| s.name.trim() == name);
            PickedStudent {
                name: name.to_string(),
                rarity,
                avatar: student.and_then(|s| s.avatar.clone()),
                academy: student.and_then(|s| s.academy.clone()),
                club: student.and_then(|s| s.club.clone()),
            }
        };

        hide_pick_count_window(&app);
        let is_recruit = source.as_deref() == Some("recruit");
        if !is_recruit {
            crate::windows::hide_recruit_window(&app);
        }

        let (token, config) = {
            let mut guard = state.inner.lock().map_err(|_| state_locked())?;
            guard.floating_hidden_for_pick_count = true;
            guard.current_pick_results = vec![picked_student.clone()];
            guard.pick_result_token = guard.pick_result_token.saturating_add(1);
            guard.draw_trigger_source = source;
            (
                guard.pick_result_token,
                guard.config.pick_result_dialog.clone(),
            )
        };

        let picked_students = vec![picked_student];
        if is_recruit {
            if let Some(window) = app.get_webview_window("recruit") {
                let _ = window.emit(
                    "pick-result-reset",
                    PickResultResetPayload {
                        token,
                        reason: "before-open".to_string(),
                    },
                );
                let _ = window.emit(
                    "pick-result-open",
                    PickResultOpenPayload {
                        token,
                        results: picked_students,
                        config,
                    },
                );
            }
            Ok(())
        } else {
            open_pick_result_window(&app, &state, picked_students)?;
            Ok(())
        }
    })
    .await?
}
