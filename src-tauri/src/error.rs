use serde::Serialize;

/// 跨 IPC 边界的应用错误类型。
///
/// 序列化为 `{ kind, message }` 形状供前端识别。
/// 前端 `tauriCore.ts` 中的 `unwrapAppError` 会把对象规范化回字符串展示。
#[derive(Debug, thiserror::Error)]
#[allow(dead_code)]
pub(crate) enum AppError {
    #[error("IO: {0}")]
    Io(#[from] std::io::Error),

    #[error("YAML: {0}")]
    Yaml(#[from] serde_yaml::Error),

    #[error("JSON: {0}")]
    Json(#[from] serde_json::Error),

    #[error("HTTP: {0}")]
    Http(#[from] reqwest::Error),

    #[error("Tauri: {0}")]
    Tauri(#[from] tauri::Error),

    #[error("State: {0}")]
    State(String),

    #[error("Config: {0}")]
    Config(String),

    #[error("Audio: {0}")]
    Audio(String),

    #[error("Window: {0}")]
    Window(String),

    #[error("Update: {0}")]
    Update(String),

    #[error("Permission: {0}")]
    Permission(String),

    #[error("{0}")]
    Other(String),
}

impl AppError {
    fn kind(&self) -> &'static str {
        match self {
            AppError::Io(_) => "io",
            AppError::Yaml(_) => "yaml",
            AppError::Json(_) => "json",
            AppError::Http(_) => "http",
            AppError::Tauri(_) => "tauri",
            AppError::State(_) => "state",
            AppError::Config(_) => "config",
            AppError::Audio(_) => "audio",
            AppError::Window(_) => "window",
            AppError::Update(_) => "update",
            AppError::Permission(_) => "permission",
            AppError::Other(_) => "other",
        }
    }
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        #[derive(Serialize)]
        struct Repr<'a> {
            kind: &'a str,
            message: String,
        }

        Repr {
            kind: self.kind(),
            message: self.to_string(),
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

pub(crate) type AppResult<T> = Result<T, AppError>;
