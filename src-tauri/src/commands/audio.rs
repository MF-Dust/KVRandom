use tauri::{AppHandle, Manager};

use crate::audio::AudioCommand;
use crate::state::AppState;

#[tauri::command]
pub(crate) async fn play_click_sound(app: AppHandle) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<AppState>();
        state.audio.send(AudioCommand::PlayClick)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub(crate) async fn play_bgm(app: AppHandle) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<AppState>();
        state.audio.send(AudioCommand::PlayBgm)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub(crate) async fn stop_bgm(app: AppHandle) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<AppState>();
        state.audio.send(AudioCommand::StopBgm)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub(crate) async fn play_gacha_sound(app: AppHandle, volume: f64) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<AppState>();
        state.audio.send(AudioCommand::PlayGacha(volume as f32))
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub(crate) async fn stop_gacha_sound(app: AppHandle) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<AppState>();
        state.audio.send(AudioCommand::StopGacha)
    })
    .await
    .map_err(|e| e.to_string())?
}
