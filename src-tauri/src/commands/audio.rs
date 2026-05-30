use tauri::{AppHandle, Manager};

use crate::audio::AudioCommand;
use crate::error::{AppError, AppResult};
use crate::state::AppState;

#[tauri::command]
pub(crate) async fn play_click_sound(
    app: AppHandle,
    path: Option<String>,
    volume: Option<f64>,
) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<AppState>();
        state
            .audio
            .send(AudioCommand::PlayClick {
                path: path.unwrap_or_else(|| "sound/button_click.wav".to_string()),
                volume: volume.unwrap_or(1.0).clamp(0.0, 1.0) as f32,
            })
            .map_err(AppError::Audio)
    })
    .await?
}

#[tauri::command]
pub(crate) async fn play_bgm(
    app: AppHandle,
    paths: Option<Vec<String>>,
    volume: Option<f64>,
) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<AppState>();
        state
            .audio
            .send(AudioCommand::PlayBgm {
                paths: paths.unwrap_or_else(|| vec!["sound/bgm.mp3".to_string()]),
                volume: volume.unwrap_or(0.3).clamp(0.0, 1.0) as f32,
            })
            .map_err(AppError::Audio)
    })
    .await?
}

#[tauri::command]
pub(crate) async fn stop_bgm(app: AppHandle) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<AppState>();
        state
            .audio
            .send(AudioCommand::StopBgm)
            .map_err(AppError::Audio)
    })
    .await?
}

#[tauri::command]
pub(crate) async fn play_gacha_sound(
    app: AppHandle,
    volume: f64,
    path: Option<String>,
) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<AppState>();
        state
            .audio
            .send(AudioCommand::PlayGacha {
                path: path.unwrap_or_else(|| "sound/gacha_loading.ogg".to_string()),
                volume: volume.clamp(0.0, 1.0) as f32,
            })
            .map_err(AppError::Audio)
    })
    .await?
}

#[tauri::command]
pub(crate) async fn stop_gacha_sound(app: AppHandle) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<AppState>();
        state
            .audio
            .send(AudioCommand::StopGacha)
            .map_err(AppError::Audio)
    })
    .await?
}
