use serde::Serialize;
use std::path::PathBuf;

/// 跨 IPC 边界的应用错误类型。
///
/// 序列化为 `{ kind, message, context? }` 形状供前端识别。
/// 前端 `tauriCore.ts` 中的 `unwrapAppError` 会把对象规范化回字符串展示。
#[derive(Debug, thiserror::Error)]
#[allow(dead_code)]
pub(crate) enum AppError {
    // ===== I/O and File Errors =====
    #[error("Failed to read file: {path}")]
    FileRead {
        path: PathBuf,
        #[source]
        source: std::io::Error,
    },

    #[error("Failed to write file: {path}")]
    FileWrite {
        path: PathBuf,
        #[source]
        source: std::io::Error,
    },

    #[error("File not found: {path}")]
    FileNotFound { path: PathBuf },

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    // ===== Serialization Errors =====
    #[error("Failed to parse YAML config: {context}")]
    YamlParse {
        context: String,
        #[source]
        source: serde_yaml::Error,
    },

    #[error("Failed to serialize YAML config")]
    YamlSerialize {
        #[source]
        source: serde_yaml::Error,
    },

    #[error("Failed to parse JSON: {context}")]
    JsonParse {
        context: String,
        #[source]
        source: serde_json::Error,
    },

    #[error("Failed to serialize JSON")]
    JsonSerialize {
        #[source]
        source: serde_json::Error,
    },

    // ===== Config Errors =====
    #[error("Invalid config value: {field} = {value} (reason: {reason})")]
    ConfigInvalid {
        field: String,
        value: String,
        reason: String,
    },

    #[error("Config validation failed: {0}")]
    ConfigValidation(String),

    #[error("Failed to load config: {0}")]
    ConfigLoad(String),

    #[error("Failed to save config: {0}")]
    ConfigSave(String),

    #[error("Config migration failed from version {from} to {to}: {reason}")]
    ConfigMigration { from: u32, to: u32, reason: String },

    // ===== Student List Errors =====
    #[error("Student list is empty")]
    StudentListEmpty,

    #[error("Failed to parse student list: {0}")]
    StudentListParse(String),

    #[error("Student not found: {name}")]
    StudentNotFound { name: String },

    // ===== Audio Errors =====
    #[error("Audio file not found: {path}")]
    AudioFileNotFound { path: String },

    #[error("Failed to play audio: {path}")]
    AudioPlayback { path: String, reason: String },

    #[error("Audio error: {0}")]
    Audio(String),

    // ===== Window Errors =====
    #[error("Window not found: {label}")]
    WindowNotFound { label: String },

    #[error("Failed to create window: {label}")]
    WindowCreate { label: String, reason: String },

    #[error("Window operation failed: {0}")]
    Window(String),

    // ===== State Errors =====
    #[error("Failed to acquire state lock")]
    StateLocked,

    #[error("State error: {0}")]
    State(String),

    // ===== Network Errors =====
    #[error("HTTP request failed: {url}")]
    HttpRequest {
        url: String,
        #[source]
        source: reqwest::Error,
    },

    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),

    // ===== Update Errors =====
    #[error("Update check failed: {0}")]
    UpdateCheck(String),

    #[error("Update download failed: {0}")]
    UpdateDownload(String),

    #[error("Update install failed: {0}")]
    UpdateInstall(String),

    // ===== Permission Errors =====
    #[error("Permission denied: {operation}")]
    PermissionDenied { operation: String },

    #[error("Insufficient privileges for: {operation}")]
    InsufficientPrivileges { operation: String },

    // ===== Tauri Framework Errors =====
    #[error("Tauri error: {0}")]
    Tauri(#[from] tauri::Error),

    // ===== Generic Errors =====
    #[error("{0}")]
    Other(String),
}

impl AppError {
    fn kind(&self) -> &'static str {
        match self {
            // File errors
            AppError::FileRead { .. } => "file_read",
            AppError::FileWrite { .. } => "file_write",
            AppError::FileNotFound { .. } => "file_not_found",
            AppError::Io(_) => "io",

            // Serialization errors
            AppError::YamlParse { .. } => "yaml_parse",
            AppError::YamlSerialize { .. } => "yaml_serialize",
            AppError::JsonParse { .. } => "json_parse",
            AppError::JsonSerialize { .. } => "json_serialize",

            // Config errors
            AppError::ConfigInvalid { .. } => "config_invalid",
            AppError::ConfigValidation(_) => "config_validation",
            AppError::ConfigLoad(_) => "config_load",
            AppError::ConfigSave(_) => "config_save",
            AppError::ConfigMigration { .. } => "config_migration",

            // Student list errors
            AppError::StudentListEmpty => "student_list_empty",
            AppError::StudentListParse(_) => "student_list_parse",
            AppError::StudentNotFound { .. } => "student_not_found",

            // Audio errors
            AppError::AudioFileNotFound { .. } => "audio_file_not_found",
            AppError::AudioPlayback { .. } => "audio_playback",
            AppError::Audio(_) => "audio",

            // Window errors
            AppError::WindowNotFound { .. } => "window_not_found",
            AppError::WindowCreate { .. } => "window_create",
            AppError::Window(_) => "window",

            // State errors
            AppError::StateLocked => "state_locked",
            AppError::State(_) => "state",

            // Network errors
            AppError::HttpRequest { .. } => "http_request",
            AppError::Http(_) => "http",

            // Update errors
            AppError::UpdateCheck(_) => "update_check",
            AppError::UpdateDownload(_) => "update_download",
            AppError::UpdateInstall(_) => "update_install",

            // Permission errors
            AppError::PermissionDenied { .. } => "permission_denied",
            AppError::InsufficientPrivileges { .. } => "insufficient_privileges",

            // Tauri and generic
            AppError::Tauri(_) => "tauri",
            AppError::Other(_) => "other",
        }
    }

    /// Extract optional context information for frontend display
    fn context(&self) -> Option<String> {
        match self {
            AppError::FileRead { path, .. } | AppError::FileWrite { path, .. } => {
                Some(path.display().to_string())
            }
            AppError::FileNotFound { path } => Some(path.display().to_string()),
            AppError::ConfigInvalid { field, value, .. } => Some(format!("{field}={value}")),
            AppError::ConfigMigration { from, to, .. } => Some(format!("v{from} → v{to}")),
            AppError::StudentNotFound { name } => Some(name.clone()),
            AppError::AudioFileNotFound { path } | AppError::AudioPlayback { path, .. } => {
                Some(path.clone())
            }
            AppError::WindowNotFound { label } | AppError::WindowCreate { label, .. } => {
                Some(label.clone())
            }
            AppError::HttpRequest { url, .. } => Some(url.clone()),
            _ => None,
        }
    }
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        #[derive(Serialize)]
        struct Repr {
            kind: &'static str,
            message: String,
            #[serde(skip_serializing_if = "Option::is_none")]
            context: Option<String>,
        }

        Repr {
            kind: self.kind(),
            message: self.to_string(),
            context: self.context(),
        }
        .serialize(serializer)
    }
}

impl From<String> for AppError {
    fn from(value: String) -> Self {
        AppError::Other(value)
    }
}

impl From<&str> for AppError {
    fn from(value: &str) -> Self {
        AppError::Other(value.to_string())
    }
}

impl AppError {
    pub(crate) fn state_locked() -> Self {
        AppError::StateLocked
    }
}

pub(crate) type AppResult<T> = Result<T, AppError>;

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn error_kind_returns_correct_kind() {
        let err = AppError::StateLocked;
        assert_eq!(err.kind(), "state_locked");

        let err = AppError::StudentNotFound {
            name: "阿罗娜".to_string(),
        };
        assert_eq!(err.kind(), "student_not_found");

        let err = AppError::ConfigInvalid {
            field: "weight".to_string(),
            value: "-1".to_string(),
            reason: "must be non-negative".to_string(),
        };
        assert_eq!(err.kind(), "config_invalid");
    }

    #[test]
    fn error_context_extracts_relevant_info() {
        let err = AppError::FileNotFound {
            path: PathBuf::from("/path/to/config.yml"),
        };
        assert!(err.context().is_some());
        assert!(err.context().unwrap().contains("config.yml"));

        let err = AppError::StudentNotFound {
            name: "阿罗娜".to_string(),
        };
        assert_eq!(err.context(), Some("阿罗娜".to_string()));

        let err = AppError::StateLocked;
        assert!(err.context().is_none());
    }

    #[test]
    fn error_serialization_includes_context() {
        let err = AppError::ConfigInvalid {
            field: "weight".to_string(),
            value: "-1".to_string(),
            reason: "must be non-negative".to_string(),
        };

        let json = serde_json::to_value(&err).unwrap();
        assert_eq!(json["kind"], "config_invalid");
        assert!(json["message"].as_str().unwrap().contains("weight"));
        assert!(json["context"].as_str().unwrap().contains("weight=-1"));
    }

    #[test]
    fn helper_functions_construct_correct_errors() {
        let err = AppError::state_locked();
        assert_eq!(err.kind(), "state_locked");
    }

    #[test]
    fn error_display_provides_meaningful_messages() {
        let err = AppError::ConfigInvalid {
            field: "weight".to_string(),
            value: "-1".to_string(),
            reason: "must be non-negative".to_string(),
        };
        let msg = err.to_string();
        assert!(msg.contains("weight"));
        assert!(msg.contains("-1"));
        assert!(msg.contains("must be non-negative"));

        let err = AppError::ConfigMigration {
            from: 1,
            to: 2,
            reason: "incompatible schema".to_string(),
        };
        let msg = err.to_string();
        assert!(msg.contains("1"));
        assert!(msg.contains("2"));
        assert!(msg.contains("incompatible schema"));
    }
}
