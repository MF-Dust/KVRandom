use serde_json::Value;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::AppHandle;

use super::{
    config_path, escape_yaml_string, normalize_config_value, AppConfig, ConfigFileSignature,
    FileSignature, Student,
};

pub(crate) fn list_path(app: &AppHandle) -> Result<PathBuf, String> {
    let _ = app;
    Ok(super::program_dir()?.join("list.yaml"))
}

pub(crate) fn to_list_yaml_with_comments(students: &[Student]) -> String {
    let mut lines = vec![
        "# 学生名单～".to_string(),
        "# 支持的字段: name(姓名), weight(权重), avatar(立绘路径), academy(学院), club(社团)"
            .to_string(),
        String::new(),
    ];
    if students.is_empty() {
        lines.push("students: []".to_string());
    } else {
        lines.push("students:".to_string());
        for student in students {
            lines.push(format!(
                "  - name: \"{}\"",
                escape_yaml_string(&student.name)
            ));
            lines.push(format!("    weight: {}", student.weight));
            if let Some(avatar) = &student.avatar {
                lines.push(format!("    avatar: \"{}\"", escape_yaml_string(avatar)));
            }
            if let Some(academy) = &student.academy {
                lines.push(format!("    academy: \"{}\"", escape_yaml_string(academy)));
            }
            if let Some(club) = &student.club {
                lines.push(format!("    club: \"{}\"", escape_yaml_string(club)));
            }
        }
    }
    lines.push(String::new());
    lines.join("\n")
}

fn value_as_string(value: Option<&Value>, fallback: &str) -> String {
    match value {
        Some(Value::String(text)) => text.clone(),
        Some(Value::Number(number)) => number.to_string(),
        Some(Value::Bool(value)) => value.to_string(),
        _ => fallback.to_string(),
    }
}

fn value_as_f64(value: Option<&Value>, fallback: f64) -> f64 {
    match value {
        Some(Value::Number(number)) => number.as_f64().unwrap_or(fallback),
        Some(Value::String(text)) => text.parse::<f64>().unwrap_or(fallback),
        _ => fallback,
    }
}

fn get_field<'a>(value: &'a Value, key: &str) -> Option<&'a Value> {
    value.as_object().and_then(|object| object.get(key))
}

pub(crate) fn load_student_list(app: &AppHandle) -> Result<Vec<Student>, String> {
    let path = list_path(app)?;
    if !path.exists() {
        return Ok(Vec::new());
    }
    let raw = fs::read_to_string(&path).map_err(|e| format!("读取名单失败啦: {e}"))?;
    let parsed: Value = serde_yaml::from_str(&raw).map_err(|e| format!("解析名单失败啦: {e}"))?;
    let mut students = Vec::new();
    if let Some(Value::Array(items)) = get_field(&parsed, "students") {
        for item in items {
            if let Value::Object(_) = item {
                let name = value_as_string(get_field(item, "name"), "")
                    .trim()
                    .to_string();
                if !name.is_empty() {
                    let avatar = match get_field(item, "avatar") {
                        Some(Value::String(s)) if !s.trim().is_empty() => {
                            Some(s.trim().to_string())
                        }
                        _ => None,
                    };
                    let academy = match get_field(item, "academy") {
                        Some(Value::String(s)) if !s.trim().is_empty() => {
                            Some(s.trim().to_string())
                        }
                        _ => None,
                    };
                    let club = match get_field(item, "club") {
                        Some(Value::String(s)) if !s.trim().is_empty() => {
                            Some(s.trim().to_string())
                        }
                        _ => None,
                    };
                    students.push(Student {
                        name,
                        weight: value_as_f64(get_field(item, "weight"), 1.0),
                        avatar,
                        academy,
                        club,
                    });
                }
            }
        }
    }
    Ok(students)
}

pub(crate) fn save_student_list(app: &AppHandle, students: &[Student]) -> Result<(), String> {
    let path = list_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("创建目录失败啦: {e}"))?;
    }
    fs::write(path, to_list_yaml_with_comments(students))
        .map_err(|e| format!("写入名单失败啦: {e}"))
}

fn file_signature(path: &Path) -> Option<FileSignature> {
    let metadata = fs::metadata(path).ok()?;
    Some(FileSignature {
        modified: metadata.modified().ok(),
        len: metadata.len(),
    })
}

pub(crate) fn current_config_signature(
    app: &AppHandle,
) -> Result<Option<ConfigFileSignature>, String> {
    let signature = ConfigFileSignature {
        config: file_signature(&config_path(app)?),
        list: file_signature(&list_path(app)?),
    };
    if signature.config.is_none() && signature.list.is_none() {
        Ok(None)
    } else {
        Ok(Some(signature))
    }
}

pub(crate) fn to_config_yaml_with_comments(config: &AppConfig) -> String {
    let fb = &config.floating_button;
    let pick = &config.pick_count_dialog;
    let pick_result = &config.pick_result_dialog;
    let pos_x = fb
        .position
        .x
        .map(|value| value.to_string())
        .unwrap_or_else(|| "null".to_string());
    let pos_y = fb
        .position
        .y
        .map(|value| value.to_string())
        .unwrap_or_else(|| "null".to_string());
    [
        format!("allowRepeatDraw: {}", config.allow_repeat_draw),
        String::new(),
        "# 字体选择配置，留空使用默认系统字体～".to_string(),
        format!(
            "fontFamily: \"{}\"",
            escape_yaml_string(&config.font_family)
        ),
        String::new(),
        "# 悬浮按钮配置～".to_string(),
        "floatingButton:".to_string(),
        "  # 按钮大小百分比（基准50px×50px），范围0-1000，默认100～".to_string(),
        format!("  sizePercent: {}", fb.size_percent),
        "  # 透明度百分比，范围0-100（0=完全不透明，100=完全透明），默认20～".to_string(),
        format!("  transparencyPercent: {}", fb.transparency_percent),
        "  # 是否置顶（true/false），默认true～".to_string(),
        format!("  alwaysOnTop: {}", fb.always_on_top),
        "  # 交互模式（\"simple\"表示点名人数面板，\"full\"表示完整招募界面），默认\"full\"～"
            .to_string(),
        format!("  mode: \"{}\"", fb.mode),
        "  # 悬浮按钮窗口位置（左上角屏幕坐标），退出时自动保存；null表示使用默认位置～"
            .to_string(),
        "  position:".to_string(),
        format!("    x: {pos_x}"),
        format!("    y: {pos_y}"),
        String::new(),
        "# 人数选择窗口配置～".to_string(),
        "pickCountDialog:".to_string(),
        "  # 是否默认播放点名BGM（true/false），默认false～".to_string(),
        format!("  defaultPlayMusic: {}", pick.default_play_music),
        "  # 背景变暗程度，范围0-100（100接近全黑），默认50～".to_string(),
        format!(
            "  backgroundDarknessPercent: {}",
            pick.background_darkness_percent
        ),
        "  # 每次默认点名人数，范围1-10的整数，默认1～".to_string(),
        format!("  defaultCount: {}", pick.default_count),
        String::new(),
        "# 点名结果动画音效配置～".to_string(),
        "pickResultDialog:".to_string(),
        "  # 是否默认播放点名音效（true/false），默认true～".to_string(),
        format!(
            "  defaultPlayGachaSound: {}",
            pick_result.default_play_gacha_sound
        ),
        "  # 点名音效音量（0.0-1.0），默认0.6～".to_string(),
        format!("  gachaSoundVolume: {}", pick_result.gacha_sound_volume),
        String::new(),
        "# 招募卡池配置～".to_string(),
        "recruitPools:".to_string(),
        {
            if config.recruit_pools.is_empty() {
                "  []".to_string()
            } else {
                let mut pool_lines = Vec::new();
                for pool in &config.recruit_pools {
                    pool_lines.push(format!("  - id: \"{}\"", escape_yaml_string(&pool.id)));
                    pool_lines.push(format!("    name: \"{}\"", escape_yaml_string(&pool.name)));
                    pool_lines.push(format!(
                        "    tabName: \"{}\"",
                        escape_yaml_string(&pool.tab_name)
                    ));
                    pool_lines.push(format!(
                        "    tabType: \"{}\"",
                        escape_yaml_string(&pool.tab_type)
                    ));
                    if let Some(tab_avatar) = &pool.tab_avatar {
                        pool_lines.push(format!(
                            "    tabAvatar: \"{}\"",
                            escape_yaml_string(tab_avatar)
                        ));
                    } else {
                        pool_lines.push("    tabAvatar: null".to_string());
                    }
                    if let Some(bg_video) = &pool.bg_video {
                        pool_lines
                            .push(format!("    bgVideo: \"{}\"", escape_yaml_string(bg_video)));
                    } else {
                        pool_lines.push("    bgVideo: null".to_string());
                    }
                    if let Some(bg_image) = &pool.bg_image {
                        pool_lines
                            .push(format!("    bgImage: \"{}\"", escape_yaml_string(bg_image)));
                    } else {
                        pool_lines.push("    bgImage: null".to_string());
                    }
                    pool_lines.push(format!(
                        "    startTime: \"{}\"",
                        escape_yaml_string(&pool.start_time)
                    ));
                    pool_lines.push(format!(
                        "    endTime: \"{}\"",
                        escape_yaml_string(&pool.end_time)
                    ));
                    pool_lines.push(format!(
                        "    gachaType: \"{}\"",
                        escape_yaml_string(&pool.gacha_type)
                    ));
                    pool_lines.push(format!(
                        "    description: \"{}\"",
                        escape_yaml_string(&pool.description)
                    ));
                    pool_lines.push(format!(
                        "    buttonText1: \"{}\"",
                        escape_yaml_string(&pool.button_text1)
                    ));
                    pool_lines.push(format!(
                        "    buttonText2: \"{}\"",
                        escape_yaml_string(&pool.button_text2)
                    ));
                    pool_lines.push(format!(
                        "    buttonCost1: \"{}\"",
                        escape_yaml_string(&pool.button_cost1)
                    ));
                    pool_lines.push(format!(
                        "    buttonCost2: \"{}\"",
                        escape_yaml_string(&pool.button_cost2)
                    ));
                }
                pool_lines.join("\n")
            }
        },
        String::new(),
        "# 应用配置～".to_string(),
        "webConfig:".to_string(),
        "  # 启用管理员置顶增强（Windows下会尝试管理员权限）～".to_string(),
        format!(
            "  adminTopmostEnabled: {}",
            config.web_config.admin_topmost_enabled
        ),
        "  # 是否创建开机计划任务（管理员权限运行）～".to_string(),
        format!(
            "  adminAutoStartEnabled: {}",
            config.web_config.admin_auto_start_enabled
        ),
        "  # 开机任务运行的可执行文件路径～".to_string(),
        format!(
            "  adminAutoStartPath: \"{}\"",
            escape_yaml_string(&config.web_config.admin_auto_start_path)
        ),
        "  # 开机任务名称～".to_string(),
        format!(
            "  adminAutoStartTaskName: \"{}\"",
            escape_yaml_string(&config.web_config.admin_auto_start_task_name)
        ),
        String::new(),
    ]
    .join("\n")
}

pub(crate) fn save_config(app: &AppHandle, config: &AppConfig) -> Result<(), String> {
    let path = config_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| format!("创建配置目录失败啦: {error}"))?;
    }
    fs::write(path, to_config_yaml_with_comments(config))
        .map_err(|error| format!("写入配置失败啦: {error}"))
}

fn write_default_config_if_missing(app: &AppHandle, path: &Path) -> Result<(), String> {
    if path.exists() {
        return Ok(());
    }
    save_config(app, &AppConfig::default())
}

pub(crate) fn load_config(app: &AppHandle) -> Result<AppConfig, String> {
    let path = config_path(app)?;
    write_default_config_if_missing(app, &path)?;
    let raw = fs::read_to_string(&path).map_err(|error| format!("读取配置失败啦: {error}"))?;
    let parsed: Value =
        serde_yaml::from_str(&raw).map_err(|error| format!("解析配置失败啦: {error}"))?;
    let mut normalized = normalize_config_value(parsed);
    normalized.student_list = load_student_list(app)?;
    let normalized_raw = to_config_yaml_with_comments(&normalized);
    if raw != normalized_raw {
        fs::write(&path, normalized_raw).map_err(|error| format!("写入配置失败啦: {error}"))?;
    }
    Ok(normalized)
}

pub(crate) fn load_config_with_signature(
    app: &AppHandle,
) -> Result<(AppConfig, Option<ConfigFileSignature>), String> {
    let config = load_config(app)?;
    Ok((config, current_config_signature(app)?))
}

#[cfg(target_os = "windows")]
pub(crate) fn get_system_fonts_impl() -> Vec<String> {
    use std::collections::BTreeSet;
    use winreg::enums::{HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE};
    use winreg::RegKey;

    let mut font_names = BTreeSet::new();

    // Query HKLM
    if let Ok(hklm) = RegKey::predef(HKEY_LOCAL_MACHINE)
        .open_subkey("SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts")
    {
        for val in hklm.enum_values().flatten() {
            let name = val.0;
            let cleaned = clean_font_name(&name);
            for font in cleaned {
                if !font.is_empty() {
                    font_names.insert(font);
                }
            }
        }
    }

    // Query HKCU
    if let Ok(hkcu) = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey("Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts")
    {
        for val in hkcu.enum_values().flatten() {
            let name = val.0;
            let cleaned = clean_font_name(&name);
            for font in cleaned {
                if !font.is_empty() {
                    font_names.insert(font);
                }
            }
        }
    }

    font_names.into_iter().collect()
}

#[cfg(not(target_os = "windows"))]
pub(crate) fn get_system_fonts_impl() -> Vec<String> {
    Vec::new()
}

#[cfg(target_os = "windows")]
fn clean_font_name(raw: &str) -> Vec<String> {
    let mut cleaned = raw.to_string();
    for suffix in &["(TrueType)", "(OpenType)", "(True Type)", "(PostScript)"] {
        if let Some(idx) = cleaned.to_lowercase().find(&suffix.to_lowercase()) {
            cleaned.truncate(idx);
        }
    }

    cleaned
        .split('&')
        .flat_map(|s| s.split(','))
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect()
}
