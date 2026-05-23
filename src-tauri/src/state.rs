use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};
use std::sync::Mutex;
use tauri::AppHandle;

use crate::admin::SingleInstanceGuard;
use crate::audio::AudioController;
use crate::config::{
    current_config_signature, load_config_with_signature, AppConfig, ConfigFileSignature,
};
use crate::models::PickedStudent;
use crate::picker::WeightedPool;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct LogEntry {
    pub(crate) id: String,
    pub(crate) level: String,
    pub(crate) text: String,
    pub(crate) time: String,
}

#[derive(Debug, Clone)]
pub(crate) struct DragSession {
    pub(crate) start_x: i32,
    pub(crate) start_y: i32,
    pub(crate) last_x: i32,
    pub(crate) last_y: i32,
}

pub(crate) struct RuntimeState {
    pub(crate) config: AppConfig,
    pub(crate) config_signature: Option<ConfigFileSignature>,
    pub(crate) weighted_pool_cache: Option<WeightedPool>,
    pub(crate) current_pick_results: Vec<PickedStudent>,
    pub(crate) pick_result_token: u64,
    pub(crate) drag_session: Option<DragSession>,
    pub(crate) floating_hidden_for_pick_count: bool,
    pub(crate) is_quitting: bool,
    pub(crate) logs: VecDeque<LogEntry>,
    pub(crate) log_dedup: HashMap<u64, std::time::Instant>,
    pub(crate) draw_trigger_source: Option<String>,
    pub(crate) pity_counter: u32,
}

impl RuntimeState {
    pub(crate) fn new(config: AppConfig, config_signature: Option<ConfigFileSignature>) -> Self {
        Self {
            config,
            config_signature,
            weighted_pool_cache: None,
            current_pick_results: Vec::new(),
            pick_result_token: 0,
            drag_session: None,
            floating_hidden_for_pick_count: false,
            is_quitting: false,
            logs: VecDeque::new(),
            log_dedup: HashMap::new(),
            draw_trigger_source: None,
            pity_counter: 0,
        }
    }

    pub(crate) fn apply_config(
        &mut self,
        config: AppConfig,
        config_signature: Option<ConfigFileSignature>,
        reset_weighted_pool: bool,
    ) {
        self.config = config;
        self.config_signature = config_signature;
        if reset_weighted_pool {
            self.weighted_pool_cache = None;
        }
    }
}

pub(crate) struct AppState {
    pub(crate) inner: Mutex<RuntimeState>,
    pub(crate) audio: AudioController,
    pub(crate) _single_instance_guard: SingleInstanceGuard,
}

pub(crate) fn refresh_config(
    app: &AppHandle,
    state: &tauri::State<'_, AppState>,
) -> Result<AppConfig, String> {
    let current_signature = current_config_signature(app)?;
    if let Ok(guard) = state.inner.lock() {
        if current_signature.is_some() && guard.config_signature == current_signature {
            return Ok(guard.config.clone());
        }
    }

    let (config, config_signature) = load_config_with_signature(app)?;
    let mut guard = state
        .inner
        .lock()
        .map_err(|_| "阿罗娜状态卡住了...请重试～".to_string())?;
    guard.apply_config(config.clone(), config_signature, true);
    Ok(config)
}

pub(crate) fn push_log(
    _app: &AppHandle,
    _state: &tauri::State<'_, AppState>,
    level: &str,
    text: &str,
) {
    match level {
        "error" => tracing::error!(app_level = level, "{text}"),
        "warn" | "warning" => tracing::warn!(app_level = level, "{text}"),
        "debug" | "trace" => tracing::debug!(app_level = level, "{text}"),
        _ => tracing::info!(app_level = level, "{text}"),
    }
}
