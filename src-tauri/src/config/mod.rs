use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::time::SystemTime;
use tauri::AppHandle;

pub(crate) mod normalize;
pub(crate) mod store;
pub(crate) mod student_parse;

pub(crate) use normalize::normalize_config_value;
pub(crate) use store::{
    current_config_signature, load_config, load_config_with_signature, save_config,
    save_student_list,
};
pub(crate) use student_parse::parse_student_list_text_impl;

pub(crate) const ADMIN_TASK_DEFAULT_NAME: &str = "KVRandom (Admin)";
pub(crate) const MIN_PICK_COUNT: i32 = 1;
pub(crate) const MAX_PICK_COUNT: i32 = 10;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct Student {
    pub(crate) name: String,
    pub(crate) weight: f64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) avatar: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) academy: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) club: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct FloatingPosition {
    pub(crate) x: Option<i32>,
    pub(crate) y: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct FloatingButtonConfig {
    pub(crate) size_percent: f64,
    pub(crate) transparency_percent: f64,
    pub(crate) always_on_top: bool,
    pub(crate) position: FloatingPosition,
    #[serde(default = "default_floating_mode")]
    pub(crate) mode: String,
}

fn default_floating_mode() -> String {
    "full".to_string()
}

impl Default for FloatingButtonConfig {
    fn default() -> Self {
        Self {
            size_percent: 100.0,
            transparency_percent: 20.0,
            always_on_top: true,
            position: FloatingPosition::default(),
            mode: "full".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PickCountDialogConfig {
    pub(crate) default_play_music: bool,
    pub(crate) background_darkness_percent: f64,
    pub(crate) default_count: i32,
}

impl Default for PickCountDialogConfig {
    fn default() -> Self {
        Self {
            default_play_music: false,
            background_darkness_percent: 50.0,
            default_count: 1,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PickResultDialogConfig {
    pub(crate) default_play_gacha_sound: bool,
    pub(crate) gacha_sound_volume: f64,
}

impl Default for PickResultDialogConfig {
    fn default() -> Self {
        Self {
            default_play_gacha_sound: true,
            gacha_sound_volume: 0.6,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct WebConfig {
    pub(crate) port: i32,
    pub(crate) admin_topmost_enabled: bool,
    pub(crate) admin_auto_start_enabled: bool,
    pub(crate) admin_auto_start_path: String,
    pub(crate) admin_auto_start_task_name: String,
}

impl Default for WebConfig {
    fn default() -> Self {
        Self {
            port: 21219,
            admin_topmost_enabled: false,
            admin_auto_start_enabled: false,
            admin_auto_start_path: String::new(),
            admin_auto_start_task_name: ADMIN_TASK_DEFAULT_NAME.to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RecruitPool {
    pub(crate) id: String,
    pub(crate) name: String,
    pub(crate) tab_name: String,
    pub(crate) tab_type: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) tab_avatar: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) bg_video: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) bg_image: Option<String>,
    pub(crate) start_time: String,
    pub(crate) end_time: String,
    pub(crate) gacha_type: String,
    pub(crate) description: String,
    pub(crate) button_text1: String,
    pub(crate) button_text2: String,
    pub(crate) button_cost1: String,
    pub(crate) button_cost2: String,
}

pub(crate) fn default_recruit_pools() -> Vec<RecruitPool> {
    vec![
        RecruitPool {
            id: "pool_select".to_string(),
            name: "★3学生自选招募".to_string(),
            tab_name: "★3生徒セレクト".to_string(),
            tab_type: "select".to_string(),
            tab_avatar: None,
            bg_video: Some("".to_string()),
            bg_image: Some("".to_string()),
            start_time: "2025/07/22 11:00".to_string(),
            end_time: "2026/06/24 10:59".to_string(),
            gacha_type: "select".to_string(),
            description: "购买3★学生自选券后，可以选择学生进行招募。".to_string(),
            button_text1: "购买自选券".to_string(),
            button_text2: "使用自选券".to_string(),
            button_cost1: "￥ 3,000".to_string(),
            button_cost2: "1".to_string(),
        },
        RecruitPool {
            id: "pool_shiroko".to_string(),
            name: "常驻招募 (阿比多斯)".to_string(),
            tab_name: "やってこ Your take on!".to_string(),
            tab_type: "pickup_blue".to_string(),
            tab_avatar: None,
            bg_video: Some("".to_string()),
            bg_image: Some("".to_string()),
            start_time: "2026/05/01 11:00".to_string(),
            end_time: "2026/06/01 10:59".to_string(),
            gacha_type: "gacha".to_string(),
            description: "【限时招募】特定成员的招募概率提升！".to_string(),
            button_text1: "招募1次".to_string(),
            button_text2: "招募10次".to_string(),
            button_cost1: " 青辉石 x 120".to_string(),
            button_cost2: " 青辉石 x 1200".to_string(),
        },
        RecruitPool {
            id: "pool_koyuki".to_string(),
            name: "限时招募 (千禧年)".to_string(),
            tab_name: "卷いてこ My take on!".to_string(),
            tab_type: "pickup_pink".to_string(),
            tab_avatar: None,
            bg_video: Some("".to_string()),
            bg_image: Some("".to_string()),
            start_time: "2026/05/10 11:00".to_string(),
            end_time: "2026/06/10 10:59".to_string(),
            gacha_type: "gacha".to_string(),
            description: "【限时招募】特定成员的招募概率提升！".to_string(),
            button_text1: "招募1次".to_string(),
            button_text2: "招募10次".to_string(),
            button_cost1: " 青辉石 x 120".to_string(),
            button_cost2: " 青辉石 x 1200".to_string(),
        },
        RecruitPool {
            id: "pool_kaede".to_string(),
            name: "限时招募 (百鬼夜行)".to_string(),
            tab_name: "夢を守りしはるはなの".to_string(),
            tab_type: "pickup_red".to_string(),
            tab_avatar: None,
            bg_video: Some("".to_string()),
            bg_image: Some("".to_string()),
            start_time: "2026/05/15 11:00".to_string(),
            end_time: "2026/06/15 10:59".to_string(),
            gacha_type: "gacha".to_string(),
            description: "【限时招募】特定成员的招募概率提升！".to_string(),
            button_text1: "招募1次".to_string(),
            button_text2: "招募10次".to_string(),
            button_cost1: " 青辉石 x 120".to_string(),
            button_cost2: " 青辉石 x 1200".to_string(),
        },
    ]
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AppConfig {
    pub(crate) student_list: Vec<Student>,
    pub(crate) allow_repeat_draw: bool,
    pub(crate) floating_button: FloatingButtonConfig,
    pub(crate) pick_count_dialog: PickCountDialogConfig,
    pub(crate) pick_result_dialog: PickResultDialogConfig,
    pub(crate) web_config: WebConfig,
    #[serde(default = "default_recruit_pools")]
    pub(crate) recruit_pools: Vec<RecruitPool>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            student_list: Vec::new(),
            allow_repeat_draw: true,
            floating_button: FloatingButtonConfig::default(),
            pick_count_dialog: PickCountDialogConfig::default(),
            pick_result_dialog: PickResultDialogConfig::default(),
            web_config: WebConfig::default(),
            recruit_pools: default_recruit_pools(),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct StudentListParseResult {
    pub(crate) student_list: Vec<Student>,
    pub(crate) normalized_text: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct FileSignature {
    pub(crate) modified: Option<SystemTime>,
    pub(crate) len: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct ConfigFileSignature {
    pub(crate) config: Option<FileSignature>,
    pub(crate) list: Option<FileSignature>,
}

pub(crate) fn program_dir() -> Result<PathBuf, String> {
    let exe_path =
        std::env::current_exe().map_err(|error| format!("获取程序路径失败啦: {error}"))?;
    exe_path
        .parent()
        .map(Path::to_path_buf)
        .ok_or_else(|| "获取程序所在目录失败啦".to_string())
}

pub(crate) fn legacy_run_dir() -> Option<PathBuf> {
    let current_dir = std::env::current_dir().ok()?;
    if current_dir
        .file_name()
        .and_then(|name| name.to_str())
        .is_some_and(|name| name == "src-tauri")
    {
        if let Some(project_dir) = current_dir.parent() {
            return Some(project_dir.to_path_buf());
        }
    }
    Some(current_dir)
}

pub(crate) fn config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let _ = app;
    Ok(program_dir()?.join("config.yml"))
}

pub(crate) fn escape_yaml_string(value: &str) -> String {
    value.replace('\\', "\\\\").replace('"', "\\\"")
}
