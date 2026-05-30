use serde_json::Value;

use super::{
    AppConfig, FloatingButtonConfig, FloatingPosition, PickCountDialogConfig,
    PickResultDialogConfig, RecruitPool, Student, WebConfig, MAX_PICK_COUNT, MIN_PICK_COUNT,
};
use crate::utils::{clamp_f64, clamp_i32};

fn value_as_f64(value: Option<&Value>, fallback: f64) -> f64 {
    match value {
        Some(Value::Number(number)) => number.as_f64().unwrap_or(fallback),
        Some(Value::String(text)) => text.parse::<f64>().unwrap_or(fallback),
        _ => fallback,
    }
}

fn value_as_i32(value: Option<&Value>, fallback: i32) -> i32 {
    value_as_f64(value, fallback as f64).round() as i32
}

fn value_as_optional_i32(value: Option<&Value>) -> Option<i32> {
    match value {
        Some(Value::Number(number)) => number.as_f64().map(|value| value.round() as i32),
        Some(Value::String(text)) => {
            let trimmed = text.trim();
            if trimmed.is_empty() {
                None
            } else {
                trimmed
                    .parse::<f64>()
                    .ok()
                    .map(|value| value.round() as i32)
            }
        }
        _ => None,
    }
}

fn value_as_bool(value: Option<&Value>, fallback: bool) -> bool {
    match value {
        Some(Value::Bool(value)) => *value,
        Some(Value::String(text)) => match text.trim().to_ascii_lowercase().as_str() {
            "true" | "1" | "yes" => true,
            "false" | "0" | "no" => false,
            _ => fallback,
        },
        _ => fallback,
    }
}

fn value_as_string(value: Option<&Value>, fallback: &str) -> String {
    match value {
        Some(Value::String(text)) => text.clone(),
        Some(Value::Number(number)) => number.to_string(),
        Some(Value::Bool(value)) => value.to_string(),
        _ => fallback.to_string(),
    }
}

fn get_field<'a>(value: &'a Value, key: &str) -> Option<&'a Value> {
    value.as_object().and_then(|object| object.get(key))
}

pub(crate) fn normalize_config_value(value: Value) -> AppConfig {
    let default = AppConfig::default();
    let mut student_list = Vec::new();
    if let Some(Value::Array(students)) = get_field(&value, "studentList") {
        for item in students {
            match item {
                Value::String(name) => {
                    let trimmed = name.trim();
                    if !trimmed.is_empty() {
                        student_list.push(Student {
                            name: trimmed.to_string(),
                            weight: 1.0,
                            avatar: None,
                            academy: None,
                            club: None,
                        });
                    }
                }
                Value::Object(_) => {
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
                        student_list.push(Student {
                            name,
                            weight: value_as_f64(get_field(item, "weight"), 1.0),
                            avatar,
                            academy,
                            club,
                        });
                    }
                }
                _ => {}
            }
        }
    }

    let fb = get_field(&value, "floatingButton").unwrap_or(&Value::Null);
    let position = get_field(fb, "position").unwrap_or(&Value::Null);
    let pick = get_field(&value, "pickCountDialog").unwrap_or(&Value::Null);
    let pick_result = get_field(&value, "pickResultDialog").unwrap_or(&Value::Null);
    let web = get_field(&value, "webConfig").unwrap_or(&Value::Null);

    AppConfig {
        student_list,
        allow_repeat_draw: value_as_bool(
            get_field(&value, "allowRepeatDraw"),
            default.allow_repeat_draw,
        ),
        font_family: value_as_string(get_field(&value, "fontFamily"), &default.font_family),
        floating_button: FloatingButtonConfig {
            size_percent: clamp_f64(
                value_as_f64(
                    get_field(fb, "sizePercent"),
                    default.floating_button.size_percent,
                ),
                0.0,
                1000.0,
                default.floating_button.size_percent,
            ),
            transparency_percent: clamp_f64(
                value_as_f64(
                    get_field(fb, "transparencyPercent"),
                    default.floating_button.transparency_percent,
                ),
                0.0,
                100.0,
                default.floating_button.transparency_percent,
            ),
            always_on_top: value_as_bool(
                get_field(fb, "alwaysOnTop"),
                default.floating_button.always_on_top,
            ),
            position: FloatingPosition {
                x: value_as_optional_i32(get_field(position, "x")),
                y: value_as_optional_i32(get_field(position, "y")),
            },
            mode: {
                let m = value_as_string(get_field(fb, "mode"), "full");
                if m == "simple" || m == "full" {
                    m
                } else {
                    "full".to_string()
                }
            },
        },
        pick_count_dialog: PickCountDialogConfig {
            default_play_music: value_as_bool(
                get_field(pick, "defaultPlayMusic"),
                default.pick_count_dialog.default_play_music,
            ),
            background_darkness_percent: clamp_f64(
                value_as_f64(
                    get_field(pick, "backgroundDarknessPercent"),
                    default.pick_count_dialog.background_darkness_percent,
                ),
                0.0,
                100.0,
                default.pick_count_dialog.background_darkness_percent,
            ),
            default_count: clamp_i32(
                value_as_i32(
                    get_field(pick, "defaultCount"),
                    default.pick_count_dialog.default_count,
                ),
                MIN_PICK_COUNT,
                MAX_PICK_COUNT,
                default.pick_count_dialog.default_count,
            ),
        },
        pick_result_dialog: PickResultDialogConfig {
            default_play_gacha_sound: value_as_bool(
                get_field(pick_result, "defaultPlayGachaSound"),
                default.pick_result_dialog.default_play_gacha_sound,
            ),
            gacha_sound_volume: clamp_f64(
                value_as_f64(
                    get_field(pick_result, "gachaSoundVolume"),
                    default.pick_result_dialog.gacha_sound_volume,
                ),
                0.0,
                1.0,
                default.pick_result_dialog.gacha_sound_volume,
            ),
        },
        web_config: WebConfig {
            admin_topmost_enabled: value_as_bool(
                get_field(web, "adminTopmostEnabled"),
                default.web_config.admin_topmost_enabled,
            ),
            admin_auto_start_enabled: value_as_bool(
                get_field(web, "adminAutoStartEnabled"),
                default.web_config.admin_auto_start_enabled,
            ),
            admin_auto_start_path: value_as_string(
                get_field(web, "adminAutoStartPath"),
                &default.web_config.admin_auto_start_path,
            ),
            admin_auto_start_task_name: {
                let value = value_as_string(
                    get_field(web, "adminAutoStartTaskName"),
                    &default.web_config.admin_auto_start_task_name,
                );
                if value.trim().is_empty() {
                    default.web_config.admin_auto_start_task_name
                } else {
                    value.trim().to_string()
                }
            },
        },
        recruit_pools: match get_field(&value, "recruitPools") {
            Some(Value::Array(items)) => {
                let mut pools = Vec::new();
                for item in items {
                    if let Value::Object(_) = item {
                        let id = value_as_string(get_field(item, "id"), "");
                        let name = value_as_string(get_field(item, "name"), "");
                        if !id.is_empty() && !name.is_empty() {
                            pools.push(RecruitPool {
                                id,
                                name,
                                tab_name: value_as_string(get_field(item, "tabName"), ""),
                                tab_type: value_as_string(
                                    get_field(item, "tabType"),
                                    "pickup_blue",
                                ),
                                tab_avatar: match get_field(item, "tabAvatar") {
                                    Some(Value::String(s)) if !s.trim().is_empty() => {
                                        Some(s.trim().to_string())
                                    }
                                    _ => None,
                                },
                                bg_video: match get_field(item, "bgVideo") {
                                    Some(Value::String(s)) if !s.trim().is_empty() => {
                                        Some(s.trim().to_string())
                                    }
                                    _ => None,
                                },
                                bg_image: match get_field(item, "bgImage") {
                                    Some(Value::String(s)) if !s.trim().is_empty() => {
                                        Some(s.trim().to_string())
                                    }
                                    _ => None,
                                },
                                start_time: value_as_string(get_field(item, "startTime"), ""),
                                end_time: value_as_string(get_field(item, "endTime"), ""),
                                gacha_type: value_as_string(get_field(item, "gachaType"), "gacha"),
                                description: value_as_string(get_field(item, "description"), ""),
                                button_text1: value_as_string(get_field(item, "buttonText1"), ""),
                                button_text2: value_as_string(get_field(item, "buttonText2"), ""),
                                button_cost1: value_as_string(get_field(item, "buttonCost1"), ""),
                                button_cost2: value_as_string(get_field(item, "buttonCost2"), ""),
                            });
                        }
                    }
                }
                pools
            }
            _ => default.recruit_pools.clone(),
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::ADMIN_TASK_DEFAULT_NAME;

    #[test]
    fn normalize_config_value_uses_backend_defaults_for_missing_fields() {
        let result = normalize_config_value(Value::Null);

        assert!(result.student_list.is_empty());
        assert!(result.allow_repeat_draw);
        assert_eq!(result.floating_button.size_percent, 100.0);
        assert_eq!(result.floating_button.transparency_percent, 20.0);
        assert!(result.floating_button.always_on_top);
        assert_eq!(result.floating_button.position.x, None);
        assert_eq!(result.floating_button.position.y, None);
        assert!(!result.pick_count_dialog.default_play_music);
        assert_eq!(result.pick_count_dialog.background_darkness_percent, 50.0);
        assert_eq!(result.pick_count_dialog.default_count, MIN_PICK_COUNT);
        assert!(result.pick_result_dialog.default_play_gacha_sound);
        assert_eq!(result.pick_result_dialog.gacha_sound_volume, 0.6);
        assert_eq!(
            result.web_config.admin_auto_start_task_name,
            ADMIN_TASK_DEFAULT_NAME
        );
    }

    #[test]
    fn normalize_config_value_clamps_numeric_ranges() {
        let result = normalize_config_value(serde_json::json!({
            "floatingButton": {
                "sizePercent": -1,
                "transparencyPercent": 150
            },
            "pickCountDialog": {
                "backgroundDarknessPercent": -20,
                "defaultCount": 99
            },
            "pickResultDialog": {
                "gachaSoundVolume": 2
            }
        }));

        assert_eq!(result.floating_button.size_percent, 0.0);
        assert_eq!(result.floating_button.transparency_percent, 100.0);
        assert_eq!(result.pick_count_dialog.background_darkness_percent, 0.0);
        assert_eq!(result.pick_count_dialog.default_count, MAX_PICK_COUNT);
        assert_eq!(result.pick_result_dialog.gacha_sound_volume, 1.0);
    }

    #[test]
    fn normalize_config_value_clamps_pick_count_to_minimum() {
        let result = normalize_config_value(serde_json::json!({
            "pickCountDialog": {
                "defaultCount": -5
            }
        }));

        assert_eq!(result.pick_count_dialog.default_count, MIN_PICK_COUNT);
    }
}
