use crate::error::AppResult;

#[tauri::command]
pub(crate) async fn pick_student_avatar() -> AppResult<Option<String>> {
    tauri::async_runtime::spawn_blocking(move || {
        let path = rfd::FileDialog::new()
            .add_filter("图片文件", &["png", "jpg", "jpeg", "webp", "gif"])
            .pick_file();
        Ok::<_, crate::error::AppError>(path.map(|p| p.to_string_lossy().to_string()))
    })
    .await?
}
