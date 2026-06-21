use std::fs;
use tauri::{AppHandle, Emitter, Manager};

use crate::config::{
    current_config_signature, normalize_config_value, parse_student_list_text_impl, save_config,
    save_student_list, AppConfig, Student, StudentListParseResult,
};
use crate::error::{AppError, AppResult};
use crate::models::ApiResult;
use crate::state::{push_log, refresh_config, AppState};
use crate::windows::{apply_floating_window_config, create_floating_window};

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
pub(crate) async fn pick_asset_file(kind: Option<String>) -> AppResult<Option<String>> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<Option<String>> {
        let mut dialog = rfd::FileDialog::new();
        match kind.as_deref() {
            Some("image") => {
                dialog =
                    dialog.add_filter("图片文件", &["png", "jpg", "jpeg", "webp", "gif", "svg"]);
            }
            Some("audio") => {
                dialog = dialog.add_filter("音频文件", &["mp3", "wav", "ogg", "flac"]);
            }
            Some("video") => {
                dialog = dialog.add_filter("视频文件", &["mp4", "webm", "mov"]);
            }
            _ => {
                dialog = dialog.add_filter(
                    "资源文件",
                    &[
                        "png", "jpg", "jpeg", "webp", "gif", "svg", "mp3", "wav", "ogg", "mp4",
                        "webm",
                    ],
                );
            }
        }

        Ok(dialog
            .pick_file()
            .map(|path| path.to_string_lossy().to_string()))
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
            let mut guard = state.inner.lock().map_err(|_| AppError::state_locked())?;
            guard.apply_config(normalized.clone(), config_signature, true);
        }
        if let Some(window) = app.get_webview_window("floating") {
            apply_floating_window_config(&window, &normalized);
        } else {
            create_floating_window(&app, &normalized)?;
        }
        let _ = app.emit("config-updated", &normalized);
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
pub(crate) async fn get_system_fonts() -> AppResult<Vec<String>> {
    tauri::async_runtime::spawn_blocking(move || Ok(crate::config::get_system_fonts_impl())).await?
}
