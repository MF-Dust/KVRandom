#[tauri::command]
pub(crate) async fn pick_student_avatar() -> Result<Option<String>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let path = rfd::FileDialog::new()
            .add_filter("图片文件", &["png", "jpg", "jpeg", "webp", "gif"])
            .pick_file();
        Ok(path.map(|p| p.to_string_lossy().to_string()))
    })
    .await
    .map_err(|e| e.to_string())?
}
