use tauri::{AppHandle, Manager};

use crate::admin::{create_admin_startup_task_impl, is_process_elevated, request_admin_relaunch};
use crate::config::ADMIN_TASK_DEFAULT_NAME;
use crate::models::{ApiResult, AppInfo, UpdateResult};
use crate::state::{refresh_config, AppState};
use crate::update::check_update_from_main;

#[tauri::command]
pub(crate) async fn get_app_info(app: AppHandle) -> Result<AppInfo, String> {
    tauri::async_runtime::spawn_blocking(move || {
        Ok(AppInfo {
            version: app.package_info().version.to_string(),
            is_debug_mode: cfg!(debug_assertions),
            is_admin: is_process_elevated(),
            exe_path: std::env::current_exe()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string(),
        })
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub(crate) async fn check_update(app: AppHandle) -> Result<UpdateResult, String> {
    Ok(check_update_from_main(&app.package_info().version.to_string()).await)
}

#[tauri::command]
pub(crate) async fn request_admin_elevation(app: AppHandle) -> Result<ApiResult, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<AppState>();
        if is_process_elevated() {
            return Ok(ApiResult {
                ok: true,
                message: "已经以管理员权限运行啦～".to_string(),
                detail: None,
                restart_required: None,
            });
        }
        let result = request_admin_relaunch();
        if result.ok {
            state
                .inner
                .lock()
                .map_err(|_| "阿罗娜状态卡住了...请重试～".to_string())?
                .is_quitting = true;
            let app_clone = app.clone();
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_millis(150));
                app_clone.exit(0);
            });
        }
        Ok(result)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub(crate) async fn create_admin_startup_task(
    app: AppHandle,
    exe_path: String,
    task_name: String,
) -> Result<ApiResult, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<AppState>();
        let result = create_admin_startup_task_impl(&task_name, &exe_path);
        if result.ok {
            let mut config = refresh_config(&app, &state)?;
            config.web_config.admin_auto_start_enabled = true;
            config.web_config.admin_auto_start_path = exe_path.trim().to_string();
            config.web_config.admin_auto_start_task_name = if task_name.trim().is_empty() {
                ADMIN_TASK_DEFAULT_NAME.to_string()
            } else {
                task_name.trim().to_string()
            };
            crate::config::save_config(&app, &config)?;
            let config_signature = crate::config::current_config_signature(&app).ok().flatten();
            let mut guard = state
                .inner
                .lock()
                .map_err(|_| "阿罗娜状态卡住了...请重试～".to_string())?;
            guard.apply_config(config, config_signature, true);
        }
        Ok(result)
    })
    .await
    .map_err(|e| e.to_string())?
}
