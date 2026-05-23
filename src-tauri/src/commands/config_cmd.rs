use std::fs;
use tauri::{AppHandle, Manager};

use crate::config::{
    current_config_signature, normalize_config_value, parse_student_list_text_impl, save_config,
    save_student_list, AppConfig, Student, StudentListParseResult,
};
use crate::error::{AppError, AppResult};
use crate::models::ApiResult;
use crate::state::{push_log, refresh_config, AppState};
use crate::windows::{apply_floating_window_config, create_floating_window};

fn state_locked() -> AppError {
    AppError::State("阿罗娜状态卡住了...请重试～".to_string())
}

#[tauri::command]
pub(crate) async fn open_config(app: AppHandle) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<()> {
        crate::windows::open_config_window(&app)?;
        Ok(())
    })
    .await?
}

#[tauri::command]
pub(crate) async fn get_config(app: AppHandle) -> AppResult<AppConfig> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<AppConfig> {
        let state = app.state::<AppState>();
        let config = refresh_config(&app, &state)?;
        if let Some(window) = app.get_webview_window("floating") {
            apply_floating_window_config(&window, &config);
        }
        Ok(config)
    })
    .await?
}

#[tauri::command]
pub(crate) async fn parse_student_list_text(
    raw_text: String,
    existing_students: Vec<Student>,
) -> AppResult<StudentListParseResult> {
    tauri::async_runtime::spawn_blocking(move || {
        Ok(parse_student_list_text_impl(&raw_text, &existing_students))
    })
    .await?
}

#[tauri::command]
pub(crate) async fn import_student_list_from_file(
    existing_students: Vec<Student>,
) -> AppResult<Option<StudentListParseResult>> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<Option<StudentListParseResult>> {
        let Some(path) = rfd::FileDialog::new()
            .add_filter("名单文件", &["txt", "csv"])
            .pick_file()
        else {
            return Ok(None);
        };
        let raw_text = fs::read_to_string(&path)?;
        Ok(Some(parse_student_list_text_impl(
            &raw_text,
            &existing_students,
        )))
    })
    .await?
}

#[tauri::command]
pub(crate) async fn save_app_config(
    app: AppHandle,
    config: serde_json::Value,
) -> AppResult<ApiResult> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<ApiResult> {
        let state = app.state::<AppState>();
        let normalized = normalize_config_value(config);
        save_student_list(&app, &normalized.student_list)?;
        save_config(&app, &normalized)?;
        let config_signature = current_config_signature(&app).ok().flatten();
        {
            let mut guard = state.inner.lock().map_err(|_| state_locked())?;
            guard.apply_config(normalized.clone(), config_signature, true);
        }
        if let Some(window) = app.get_webview_window("floating") {
            apply_floating_window_config(&window, &normalized);
        } else {
            create_floating_window(&app, &normalized)?;
        }
        push_log(&app, &state, "info", "配置保存成功！悬浮窗已经刷新啦～");
        Ok(ApiResult {
            ok: true,
            message: "配置保存成功！悬浮窗已经刷新啦～".to_string(),
            detail: None,
            restart_required: Some(false),
        })
    })
    .await?
}

#[tauri::command]
pub(crate) async fn save_student_list_file(
    app: AppHandle,
    students: Vec<Student>,
) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<()> {
        let state = app.state::<AppState>();
        crate::config::save_student_list(&app, &students)?;
        let mut guard = state.inner.lock().map_err(|_| state_locked())?;
        guard.config.student_list = students;
        guard.weighted_pool_cache = None;
        Ok(())
    })
    .await?
}
