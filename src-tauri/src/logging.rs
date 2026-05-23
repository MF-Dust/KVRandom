use chrono::Utc;
use tauri::{AppHandle, Emitter, Manager};
use tracing::{field::Visit, Event, Subscriber};
use tracing_subscriber::{layer::Context, Layer};

use crate::state::{AppState, LogEntry};

const LOG_BUFFER_LIMIT: usize = 600;

pub(crate) struct BufferLayer {
    app: AppHandle,
}

impl BufferLayer {
    pub(crate) fn new(app: AppHandle) -> Self {
        Self { app }
    }
}

impl<S> Layer<S> for BufferLayer
where
    S: Subscriber,
{
    fn on_event(&self, event: &Event<'_>, _ctx: Context<'_, S>) {
        let mut visitor = LogVisitor::default();
        event.record(&mut visitor);

        let tracing_level = match *event.metadata().level() {
            tracing::Level::ERROR => "error",
            tracing::Level::WARN => "warn",
            tracing::Level::INFO => "info",
            tracing::Level::DEBUG => "debug",
            tracing::Level::TRACE => "trace",
        };

        let now = Utc::now();
        let entry = LogEntry {
            id: format!("{}-{}", now.timestamp_millis(), rand::random::<u64>()),
            level: visitor
                .app_level
                .unwrap_or_else(|| tracing_level.to_string()),
            text: visitor.message.unwrap_or_default(),
            time: now.to_rfc3339(),
        };

        if let Some(state) = self.app.try_state::<AppState>() {
            if let Ok(mut guard) = state.inner.lock() {
                guard.logs.push_back(entry.clone());
                while guard.logs.len() > LOG_BUFFER_LIMIT {
                    guard.logs.pop_front();
                }
            }
        }

        let _ = self.app.emit("log-entry", entry);
    }
}

#[derive(Default)]
struct LogVisitor {
    message: Option<String>,
    app_level: Option<String>,
}

impl Visit for LogVisitor {
    fn record_str(&mut self, field: &tracing::field::Field, value: &str) {
        match field.name() {
            "message" => self.message = Some(value.to_string()),
            "app_level" => self.app_level = Some(value.to_string()),
            _ => {}
        }
    }

    fn record_debug(&mut self, field: &tracing::field::Field, value: &dyn std::fmt::Debug) {
        if field.name() == "message" {
            self.message = Some(format!("{value:?}").trim_matches('"').to_string());
        }
    }
}
