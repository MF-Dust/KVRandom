use rand::Rng;
use rodio::{Decoder, OutputStream, OutputStreamHandle, Sink, Source};
use std::io::Cursor;
use std::sync::mpsc;
use tauri::AppHandle;

use crate::utils::load_asset_bytes;
pub(crate) enum AudioCommand {
    PlayClick { path: String, volume: f32 },
    PlayBgm { paths: Vec<String>, volume: f32 },
    StopBgm,
    PlayGacha { path: String, volume: f32 },
    StopGacha,
}

#[derive(Clone)]
pub(crate) struct AudioController {
    tx: mpsc::Sender<AudioCommand>,
}

impl AudioController {
    pub(crate) fn new(app: &AppHandle) -> Self {
        let (tx, rx) = mpsc::channel();
        let app = app.clone();
        std::thread::spawn(move || run_audio_thread(rx, app));
        Self { tx }
    }

    pub(crate) fn send(&self, command: AudioCommand) -> Result<(), String> {
        self.tx.send(command).map_err(|error| error.to_string())
    }
}

fn run_audio_thread(rx: mpsc::Receiver<AudioCommand>, app: AppHandle) {
    let Ok((_stream, handle)) = OutputStream::try_default() else {
        return;
    };
    let mut bgm_sink: Option<Sink> = None;
    let mut gacha_sink: Option<Sink> = None;
    let mut click_bytes: Option<Vec<u8>> = None;
    let mut bgm_bytes: Option<Vec<u8>> = None;
    let mut ost338_bytes: Option<Vec<u8>> = None;
    let mut gacha_bytes: Option<Vec<u8>> = None;

    while let Ok(command) = rx.recv() {
        match command {
            AudioCommand::PlayClick { path, volume } => {
                let owned_bytes;
                let bytes = if path == "sound/button_click.wav" {
                    cached_asset_bytes(&app, &mut click_bytes, &path)
                } else {
                    owned_bytes = load_asset_bytes(&app, &path);
                    &owned_bytes
                };
                play_audio_once(&handle, bytes, volume);
            }
            AudioCommand::PlayBgm { paths, volume } => {
                if let Some(sink) = bgm_sink.take() {
                    sink.stop();
                }
                let path = if paths.is_empty() {
                    "sound/bgm.mp3".to_string()
                } else {
                    let index = rand::thread_rng().gen_range(0..paths.len());
                    paths[index].clone()
                };
                let owned_bytes;
                let bytes = match path.as_str() {
                    "sound/Yuudachi - Blue Archive OST 338.mp3" => cached_asset_bytes(
                        &app,
                        &mut ost338_bytes,
                        "sound/Yuudachi - Blue Archive OST 338.mp3",
                    ),
                    "sound/bgm.mp3" => cached_asset_bytes(&app, &mut bgm_bytes, "sound/bgm.mp3"),
                    _ => {
                        owned_bytes = load_asset_bytes(&app, &path);
                        &owned_bytes
                    }
                };
                bgm_sink = play_audio_loop(&handle, bytes, volume);
            }
            AudioCommand::StopBgm => {
                if let Some(sink) = bgm_sink.take() {
                    sink.stop();
                }
            }
            AudioCommand::PlayGacha { path, volume } => {
                if let Some(sink) = gacha_sink.take() {
                    sink.stop();
                }
                let owned_bytes;
                let bytes = if path == "sound/gacha_loading.ogg" {
                    cached_asset_bytes(&app, &mut gacha_bytes, &path)
                } else {
                    owned_bytes = load_asset_bytes(&app, &path);
                    &owned_bytes
                };
                gacha_sink = play_audio_sink(&handle, bytes, volume);
            }
            AudioCommand::StopGacha => {
                if let Some(sink) = gacha_sink.take() {
                    sink.stop();
                }
            }
        }
    }
}

fn cached_asset_bytes<'a>(
    app: &AppHandle,
    cache: &'a mut Option<Vec<u8>>,
    relative_path: &str,
) -> &'a [u8] {
    if cache.is_none() {
        *cache = Some(load_asset_bytes(app, relative_path));
    }
    cache.as_deref().unwrap_or(&[])
}

fn decoder_from_bytes(bytes: &[u8]) -> Option<Decoder<Cursor<Vec<u8>>>> {
    if bytes.is_empty() {
        return None;
    }
    Decoder::new(Cursor::new(bytes.to_vec())).ok()
}

fn play_audio_once(handle: &OutputStreamHandle, bytes: &[u8], volume: f32) {
    if let Some(sink) = play_audio_sink(handle, bytes, volume) {
        sink.detach();
    }
}

fn play_audio_sink(handle: &OutputStreamHandle, bytes: &[u8], volume: f32) -> Option<Sink> {
    let sink = Sink::try_new(handle).ok()?;
    let source = decoder_from_bytes(bytes)?;
    sink.set_volume(volume.clamp(0.0, 1.0));
    sink.append(source);
    Some(sink)
}

fn play_audio_loop(handle: &OutputStreamHandle, bytes: &[u8], volume: f32) -> Option<Sink> {
    let sink = Sink::try_new(handle).ok()?;
    let source = decoder_from_bytes(bytes)?.repeat_infinite();
    sink.set_volume(volume.clamp(0.0, 1.0));
    sink.append(source);
    Some(sink)
}
