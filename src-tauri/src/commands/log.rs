use std::hash::{Hash, Hasher};
use tauri::{AppHandle, Manager};

use crate::error::AppResult;
use crate::state::{push_log, AppState, LogEntry};

#[tauri::command]
pub(crate) async fn renderer_log(app: AppHandle, level: String, text: String) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<()> {
        let state = app.state::<AppState>();
        let level = if level.trim().is_empty() {
            "info"
        } else {
            level.trim()
        };
        let mut hasher = std::collections::hash_map::DefaultHasher::new();
        level.hash(&mut hasher);
        text.hash(&mut hasher);
        let key = hasher.finish();
        let now = std::time::Instant::now();
        if let Ok(mut guard) = state.inner.lock() {
            if let Some(last) = guard.log_dedup.get(&key) {
                if now.duration_since(*last).as_millis() < 1000 {
                    return Ok(());
                }
            }
            guard.log_dedup.insert(key, now);
            if guard.log_dedup.len() > 100 {
                let cutoff = now - std::time::Duration::from_secs(10);
                guard.log_dedup.retain(|_, time| *time > cutoff);
            }
        }
        push_log(&app, &state, level, &text);
        Ok(())
    })
    .await?
}

#[tauri::command]
pub(crate) async fn get_logs(app: AppHandle) -> AppResult<Vec<LogEntry>> {
    tauri::async_runtime::spawn_blocking(move || -> AppResult<Vec<LogEntry>> {
        let state = app.state::<AppState>();
        let logs = state
            .inner
            .lock()
            .map_err(|_| crate::error::AppError::state_locked())?
            .logs
            .iter()
            .cloned()
            .collect();
        Ok(logs)
    })
    .await?
}
