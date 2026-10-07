use tauri::{AppHandle, Emitter, Manager};

use crate::config::{AppConfig, PickCountDialogConfig, RecruitPool, MAX_PICK_COUNT, MIN_PICK_COUNT};
use crate::error::{AppError, AppResult};
use crate::models::{PickResultOpenPayload, PickResultResetPayload, PickedStudent};
use crate::picker::{
    assign_rarity, build_weighted_pool, build_weighted_pool_with_boosts,
    pick_students_with_repeat, pick_students_without_repeat,
    pick_students_without_repeat_with_boosts,
};
use crate::state::{push_log, refresh_config, AppState};
use crate::utils::clamp_i32;
use crate::windows::{
    apply_floating_window_config, hide_floating_window, hide_pick_count_window,
    open_pick_count_window, open_pick_result_window, stop_pick_count_bgm,
};

fn require_recruit_pool<'a>(
    config: &'a AppConfig,
    pool_id: Option<&str>,
    expected_gacha_type: &str,
) -> AppResult<&'a RecruitPool> {
    let pool_id = pool_id
        .map(str::trim)
        .filter(|id| !id.is_empty())
        .ok_or_else(|| AppError::ConfigValidation("招募请求缺少卡池 ID".to_string()))?;
    let pool = config
        .recruit_pools
        .iter()
        .find(|pool| pool.id == pool_id)
        .ok_or_else(|| AppError::ConfigValidation(format!("未找到招募卡池: {pool_id}")))?;
    if pool.gacha_type != expected_gacha_type {
        return Err(AppError::ConfigValidation(format!(
            "卡池 {pool_id} 不支持此招募方式"
        )));
    }
    Ok(pool)
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
            .map_err(|_| AppError::state_locked())?
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
            .map_err(|_| AppError::state_locked())?
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
    pool_id: Option<String>,
) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<()> {
        let state = app.state::<AppState>();
        let selected_count = clamp_i32(count, MIN_PICK_COUNT, MAX_PICK_COUNT, MIN_PICK_COUNT);
        let config = refresh_config(&app, &state)?;
        let is_recruit = source.as_deref() == Some("recruit");
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
            let mut guard = state.inner.lock().map_err(|_| AppError::state_locked())?;
            let mut pity = guard.pity_counter;
            let picked = if guard.config.allow_repeat_draw {
                if is_recruit {
                    let pool = require_recruit_pool(&guard.config, pool_id.as_deref(), "gacha")?;
                    let weighted_pool =
                        build_weighted_pool_with_boosts(&guard.config, &pool.rate_boost_students);
                    pick_students_with_repeat(
                        &weighted_pool,
                        selected_count,
                        &guard.config.student_list,
                        &mut pity,
                    )
                } else {
                    if guard.weighted_pool_cache.is_none() {
                        guard.weighted_pool_cache = Some(build_weighted_pool(&guard.config));
                    }
                    pick_students_with_repeat(
                        guard.weighted_pool_cache.as_ref().unwrap(),
                        selected_count,
                        &guard.config.student_list,
                        &mut pity,
                    )
                }
            } else if is_recruit {
                let pool = require_recruit_pool(&guard.config, pool_id.as_deref(), "gacha")?;
                pick_students_without_repeat_with_boosts(
                    &guard.config,
                    selected_count,
                    &mut pity,
                    &pool.rate_boost_students,
                )
            } else {
                pick_students_without_repeat(&guard.config, selected_count, &mut pity)
            };
            guard.pity_counter = pity;
            picked
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
        if !is_recruit {
            crate::windows::hide_recruit_window(&app);
        }

        let (token, config) = {
            let mut guard = state.inner.lock().map_err(|_| AppError::state_locked())?;
            guard.floating_hidden_for_pick_count = true;
            // Clone is necessary: picked_students is used later in open_pick_result_window (line 155)
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
    pool_id: Option<String>,
) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<()> {
        let state = app.state::<AppState>();
        let config = refresh_config(&app, &state)?;
        let is_recruit = source.as_deref() == Some("recruit");
        if is_recruit {
            require_recruit_pool(&config, pool_id.as_deref(), "select")?;
        }
        push_log(
            &app,
            &state,
            "info",
            &format!("Select student confirmed. student_name={student_name}"),
        );
        if let Some(window) = app.get_webview_window("floating") {
            apply_floating_window_config(&window, &config);
        }

        let name = student_name.trim();
        let student = config
            .student_list
            .iter()
            .find(|student| student.name.trim() == name)
            .cloned()
            .ok_or_else(|| AppError::StudentNotFound {
                name: name.to_string(),
            })?;

        let picked_student = {
            let mut guard = state.inner.lock().map_err(|_| AppError::state_locked())?;
            let mut pity = guard.pity_counter;
            let rarity = assign_rarity(&mut pity);
            guard.pity_counter = pity;

            PickedStudent {
                name: student.name,
                rarity,
                avatar: student.avatar,
                academy: student.academy,
                club: student.club,
            }
        };

        hide_pick_count_window(&app);
        if !is_recruit {
            crate::windows::hide_recruit_window(&app);
        }

        let (token, config) = {
            let mut guard = state.inner.lock().map_err(|_| AppError::state_locked())?;
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn require_recruit_pool_validates_id_and_type() {
        let config = AppConfig::default();

        let gacha = require_recruit_pool(&config, Some("pool_shiroko"), "gacha").unwrap();
        assert_eq!(gacha.id, "pool_shiroko");

        assert!(require_recruit_pool(&config, Some("pool_select"), "gacha").is_err());
        assert!(require_recruit_pool(&config, Some("missing"), "gacha").is_err());
        assert!(require_recruit_pool(&config, None, "gacha").is_err());
    }
}
