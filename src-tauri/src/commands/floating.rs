use tauri::{AppHandle, Manager, PhysicalPosition, Position, WebviewWindow};

use crate::config::FloatingButtonConfig;
use crate::state::{refresh_config, AppState, DragSession};
use crate::windows::{
    apply_floating_window_config, create_pick_count_window, create_pick_result_window,
    persist_floating_position,
};

#[tauri::command]
pub(crate) async fn get_floating_button_config(
    app: AppHandle,
) -> Result<FloatingButtonConfig, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<AppState>();
        let config = refresh_config(&app, &state)?;
        if let Some(window) = app.get_webview_window("floating") {
            apply_floating_window_config(&window, &config);
        }
        Ok(config.floating_button)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub(crate) async fn floating_button_clicked(app: AppHandle) -> Result<(), String> {
    let mode = {
        let state = app.state::<AppState>();
        let guard = state
            .inner
            .lock()
            .map_err(|_| "阿罗娜状态卡住了...请重试～".to_string())?;
        guard.config.floating_button.mode.clone()
    };
    if mode == "simple" {
        super::pick_dialog::open_pick_count(app).await
    } else {
        super::pick_result::open_recruit(app).await
    }
}

#[tauri::command]
pub(crate) async fn floating_button_drag_start(window: WebviewWindow) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = window.state::<AppState>();
        let position = window.outer_position().map_err(|error| error.to_string())?;
        state
            .inner
            .lock()
            .map_err(|_| "阿罗娜状态卡住了...请重试～".to_string())?
            .drag_session = Some(DragSession {
            start_x: position.x,
            start_y: position.y,
            last_x: position.x,
            last_y: position.y,
        });
        Ok(())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub(crate) async fn floating_button_drag_move(
    window: WebviewWindow,
    dx: f64,
    dy: f64,
) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = window.state::<AppState>();
        let mut guard = state
            .inner
            .lock()
            .map_err(|_| "阿罗娜状态卡住了...请重试～".to_string())?;
        let Some(session) = &mut guard.drag_session else {
            return Ok(());
        };
        let next_x = session.start_x + dx.round() as i32;
        let next_y = session.start_y + dy.round() as i32;
        if (next_x - session.last_x).abs() < 2 && (next_y - session.last_y).abs() < 2 {
            return Ok(());
        }
        session.last_x = next_x;
        session.last_y = next_y;
        drop(guard);
        window
            .set_position(Position::Physical(PhysicalPosition {
                x: next_x,
                y: next_y,
            }))
            .map_err(|error| error.to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub(crate) async fn floating_button_drag_end(app: AppHandle) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<AppState>();
        state
            .inner
            .lock()
            .map_err(|_| "阿罗娜状态卡住了...请重试～".to_string())?
            .drag_session = None;
        persist_floating_position(&app, &state);
        Ok(())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub(crate) async fn floating_button_set_ignore_mouse(
    window: WebviewWindow,
    _ignore: bool,
) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        window
            .set_ignore_cursor_events(false)
            .map_err(|error| error.to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub(crate) async fn prewarm_aux_windows(app: AppHandle) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        create_pick_count_window(&app)?;
        create_pick_result_window(&app)?;
        Ok(())
    })
    .await
    .map_err(|e| e.to_string())?
}
