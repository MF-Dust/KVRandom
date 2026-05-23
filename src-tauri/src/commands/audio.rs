use tauri::{AppHandle, Manager};

use crate::audio::AudioCommand;
use crate::error::{AppError, AppResult};
use crate::state::AppState;

#[tauri::command]
pub(crate) async fn play_click_sound(app: AppHandle) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<AppState>();
        state
            .audio
            .send(AudioCommand::PlayClick)
            .map_err(AppError::Audio)
    })
    .await?
}

#[tauri::command]
pub(crate) async fn play_bgm(app: AppHandle) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<AppState>();
        state
            .audio
            .send(AudioCommand::PlayBgm)
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
pub(crate) async fn play_gacha_sound(app: AppHandle, volume: f64) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<AppState>();
        state
            .audio
            .send(AudioCommand::PlayGacha(volume as f32))
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
