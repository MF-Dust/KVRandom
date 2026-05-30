use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::time::SystemTime;
use tauri::AppHandle;

pub(crate) mod normalize;
pub(crate) mod store;
pub(crate) mod student_parse;

pub(crate) use normalize::normalize_config_value;
pub(crate) use store::{
    current_config_signature, get_system_fonts_impl, load_config, load_config_with_signature,
    save_config, save_student_list,
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
    #[serde(default = "default_floating_icon_path")]
    pub(crate) icon_path: String,
    #[serde(default = "default_floating_background")]
    pub(crate) background: String,
    #[serde(default = "default_floating_border_radius_percent")]
    pub(crate) border_radius_percent: f64,
    #[serde(default = "default_true")]
    pub(crate) click_sound_enabled: bool,
    #[serde(default = "default_click_sound_path")]
    pub(crate) click_sound_path: String,
    #[serde(default = "default_full_volume")]
    pub(crate) click_sound_volume: f64,
    #[serde(default = "default_drag_threshold_px")]
    pub(crate) drag_threshold_px: f64,
}

fn default_floating_mode() -> String {
    "full".to_string()
}

fn default_floating_icon_path() -> String {
    "/image/random.svg".to_string()
}

fn default_floating_background() -> String {
    "linear-gradient(145deg, #66ccff, #4091f0)".to_string()
}

fn default_floating_border_radius_percent() -> f64 {
    50.0
}

fn default_font_family() -> String {
    String::new()
}

fn default_true() -> bool {
    true
}

fn default_click_sound_path() -> String {
    "sound/button_click.wav".to_string()
}

fn default_full_volume() -> f64 {
    1.0
}

fn default_drag_threshold_px() -> f64 {
    6.0
}

impl Default for FloatingButtonConfig {
    fn default() -> Self {
        Self {
            size_percent: 100.0,
            transparency_percent: 20.0,
            always_on_top: true,
            position: FloatingPosition::default(),
            mode: "full".to_string(),
            icon_path: default_floating_icon_path(),
            background: default_floating_background(),
            border_radius_percent: default_floating_border_radius_percent(),
            click_sound_enabled: true,
            click_sound_path: default_click_sound_path(),
            click_sound_volume: 1.0,
            drag_threshold_px: default_drag_threshold_px(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PickCountDialogConfig {
    pub(crate) default_play_music: bool,
    pub(crate) background_darkness_percent: f64,
    pub(crate) default_count: i32,
    #[serde(default = "default_pick_title")]
    pub(crate) title_text: String,
    #[serde(default = "default_min_button_text")]
    pub(crate) min_button_text: String,
    #[serde(default = "default_max_button_text")]
    pub(crate) max_button_text: String,
    #[serde(default = "default_cancel_button_text")]
    pub(crate) cancel_button_text: String,
    #[serde(default = "default_confirm_button_text")]
    pub(crate) confirm_button_text: String,
    #[serde(default = "default_music_label_text")]
    pub(crate) music_label_text: String,
    #[serde(default = "default_range_hint_text")]
    pub(crate) range_hint_text: String,
    #[serde(default = "default_pick_panel_background")]
    pub(crate) panel_background: String,
    #[serde(default = "default_bgm_volume")]
    pub(crate) bgm_volume: f64,
    #[serde(default = "default_bgm_paths")]
    pub(crate) bgm_paths: Vec<String>,
    #[serde(default = "default_true")]
    pub(crate) allow_music_toggle: bool,
    #[serde(default = "default_pick_exit_animation_ms")]
    pub(crate) exit_animation_ms: i32,
}

fn default_pick_title() -> String {
    "要点名几个人呢～".to_string()
}

fn default_min_button_text() -> String {
    "最少".to_string()
}

fn default_max_button_text() -> String {
    "最多".to_string()
}

fn default_cancel_button_text() -> String {
    "先不要了".to_string()
}

fn default_confirm_button_text() -> String {
    "开始点名！".to_string()
}

fn default_music_label_text() -> String {
    "播放超～喜庆的点名BGM！".to_string()
}

fn default_range_hint_text() -> String {
    "可选范围 {min} - {max}，老师看着办～".to_string()
}

fn default_pick_panel_background() -> String {
    "#eff6ff".to_string()
}

fn default_bgm_volume() -> f64 {
    0.3
}

fn default_bgm_paths() -> Vec<String> {
    vec![
        "sound/Yuudachi - Blue Archive OST 338.mp3".to_string(),
        "sound/bgm.mp3".to_string(),
    ]
}

fn default_pick_exit_animation_ms() -> i32 {
    400
}

impl Default for PickCountDialogConfig {
    fn default() -> Self {
        Self {
            default_play_music: false,
            background_darkness_percent: 50.0,
            default_count: 1,
            title_text: default_pick_title(),
            min_button_text: default_min_button_text(),
            max_button_text: default_max_button_text(),
            cancel_button_text: default_cancel_button_text(),
            confirm_button_text: default_confirm_button_text(),
            music_label_text: default_music_label_text(),
            range_hint_text: default_range_hint_text(),
            panel_background: default_pick_panel_background(),
            bgm_volume: default_bgm_volume(),
            bgm_paths: default_bgm_paths(),
            allow_music_toggle: true,
            exit_animation_ms: default_pick_exit_animation_ms(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PickResultDialogConfig {
    pub(crate) default_play_gacha_sound: bool,
    pub(crate) gacha_sound_volume: f64,
    #[serde(default = "default_gacha_sound_path")]
    pub(crate) gacha_sound_path: String,
    #[serde(default = "default_result_background_darkness_percent")]
    pub(crate) background_darkness_percent: f64,
    #[serde(default = "default_blue_envelope_image")]
    pub(crate) blue_envelope_image: String,
    #[serde(default = "default_gold_envelope_image")]
    pub(crate) gold_envelope_image: String,
    #[serde(default = "default_pink_envelope_image")]
    pub(crate) pink_envelope_image: String,
    #[serde(default = "default_card_size_percent")]
    pub(crate) card_size_percent: f64,
    #[serde(default = "default_result_fly_interval_ms")]
    pub(crate) fly_interval_ms: i32,
    #[serde(default = "default_result_reveal_delay_ms")]
    pub(crate) reveal_delay_ms: i32,
    #[serde(default = "default_result_close_fade_ms")]
    pub(crate) close_fade_ms: i32,
    #[serde(default = "default_close_hint_text")]
    pub(crate) close_hint_text: String,
    #[serde(default = "default_empty_text")]
    pub(crate) empty_text: String,
    #[serde(default = "default_result_confirm_button_text")]
    pub(crate) confirm_button_text: String,
    #[serde(default = "default_draw_again_button_text")]
    pub(crate) draw_again_button_text: String,
}

fn default_gacha_sound_path() -> String {
    "sound/gacha_loading.ogg".to_string()
}

fn default_result_background_darkness_percent() -> f64 {
    35.0
}

fn default_blue_envelope_image() -> String {
    "/image/blue.png".to_string()
}

fn default_gold_envelope_image() -> String {
    "/image/gold.png".to_string()
}

fn default_pink_envelope_image() -> String {
    "/image/pink.png".to_string()
}

fn default_card_size_percent() -> f64 {
    100.0
}

fn default_result_fly_interval_ms() -> i32 {
    80
}

fn default_result_reveal_delay_ms() -> i32 {
    420
}

fn default_result_close_fade_ms() -> i32 {
    220
}

fn default_close_hint_text() -> String {
    "点一下就关掉哦～".to_string()
}

fn default_empty_text() -> String {
    "还没有点名结果呢～".to_string()
}

fn default_result_confirm_button_text() -> String {
    "确认".to_string()
}

fn default_draw_again_button_text() -> String {
    "再次抽取".to_string()
}

impl Default for PickResultDialogConfig {
    fn default() -> Self {
        Self {
            default_play_gacha_sound: true,
            gacha_sound_volume: 0.6,
            gacha_sound_path: default_gacha_sound_path(),
            background_darkness_percent: default_result_background_darkness_percent(),
            blue_envelope_image: default_blue_envelope_image(),
            gold_envelope_image: default_gold_envelope_image(),
            pink_envelope_image: default_pink_envelope_image(),
            card_size_percent: default_card_size_percent(),
            fly_interval_ms: default_result_fly_interval_ms(),
            reveal_delay_ms: default_result_reveal_delay_ms(),
            close_fade_ms: default_result_close_fade_ms(),
            close_hint_text: default_close_hint_text(),
            empty_text: default_empty_text(),
            confirm_button_text: default_result_confirm_button_text(),
            draw_again_button_text: default_draw_again_button_text(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AppearanceConfig {
    pub(crate) theme_color: String,
    pub(crate) accent_color: String,
    pub(crate) page_background: String,
    pub(crate) card_radius_px: f64,
    pub(crate) compact_mode: bool,
}

impl Default for AppearanceConfig {
    fn default() -> Self {
        Self {
            theme_color: "#128afa".to_string(),
            accent_color: "#ffd84d".to_string(),
            page_background: "linear-gradient(160deg, #f0f7ff 0%, #e6f1ff 40%, #f5f9ff 100%)"
                .to_string(),
            card_radius_px: 12.0,
            compact_mode: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RecruitConfig {
    pub(crate) title_text: String,
    pub(crate) show_currency_bar: bool,
    pub(crate) default_video_path: String,
    pub(crate) skip_hint_text: String,
    pub(crate) show_result_overlay: bool,
    pub(crate) selectable_members_text: String,
    pub(crate) rates_title_text: String,
    pub(crate) selection_title_text: String,
    pub(crate) replenish_title_text: String,
    pub(crate) replenish_confirm_text: String,
    pub(crate) replenish_cancel_text: String,
    pub(crate) ap_display: String,
    pub(crate) credit_display: String,
    pub(crate) pyroxene_display: String,
    pub(crate) recruit_ticket10_display: String,
    pub(crate) recruit_ticket1_display: String,
    pub(crate) select_ticket_display: String,
}

impl Default for RecruitConfig {
    fn default() -> Self {
        Self {
            title_text: "招募成员".to_string(),
            show_currency_bar: true,
            default_video_path: "/video/vid.mp4".to_string(),
            skip_hint_text: "点击跳过 / Click to skip".to_string(),
            show_result_overlay: true,
            selectable_members_text: "可选的成员".to_string(),
            rates_title_text: "成员一览".to_string(),
            selection_title_text: "选择成员".to_string(),
            replenish_title_text: "阿罗娜的补给箱～".to_string(),
            replenish_confirm_text: "确认！".to_string(),
            replenish_cancel_text: "先不要了".to_string(),
            ap_display: "INF".to_string(),
            credit_display: "INF".to_string(),
            pyroxene_display: "INF".to_string(),
            recruit_ticket10_display: "INF".to_string(),
            recruit_ticket1_display: "INF".to_string(),
            select_ticket_display: "INF".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct WebConfig {
    pub(crate) admin_topmost_enabled: bool,
    pub(crate) admin_auto_start_enabled: bool,
    pub(crate) admin_auto_start_path: String,
    pub(crate) admin_auto_start_task_name: String,
}

impl Default for WebConfig {
    fn default() -> Self {
        Self {
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
    #[serde(default = "default_font_family")]
    pub(crate) font_family: String,
    pub(crate) floating_button: FloatingButtonConfig,
    pub(crate) pick_count_dialog: PickCountDialogConfig,
    pub(crate) pick_result_dialog: PickResultDialogConfig,
    #[serde(default)]
    pub(crate) appearance: AppearanceConfig,
    #[serde(default)]
    pub(crate) recruit_config: RecruitConfig,
    pub(crate) web_config: WebConfig,
    #[serde(default = "default_recruit_pools")]
    pub(crate) recruit_pools: Vec<RecruitPool>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            student_list: Vec::new(),
            allow_repeat_draw: true,
            font_family: String::new(),
            floating_button: FloatingButtonConfig::default(),
            pick_count_dialog: PickCountDialogConfig::default(),
            pick_result_dialog: PickResultDialogConfig::default(),
            appearance: AppearanceConfig::default(),
            recruit_config: RecruitConfig::default(),
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

pub(crate) fn config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let _ = app;
    Ok(program_dir()?.join("config.yml"))
}

pub(crate) fn escape_yaml_string(value: &str) -> String {
    value.replace('\\', "\\\\").replace('"', "\\\"")
}
