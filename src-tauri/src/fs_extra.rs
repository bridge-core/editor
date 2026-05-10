use std::process::Command;

#[tauri::command]
pub async fn reveal_in_file_explorer(path: &str) -> Result<(), String> {
    if cfg!(target_os = "windows") {
        Command::new("explorer")
            .args(["/select,", &path.replace("/", "\\")]) // The comma after select is not a typo
            .spawn()
            .expect("Failed to open file explorer");
    } else if cfg!(target_os = "macos") {
        Command::new("open")
            .args(["-R", path])
            .spawn()
            .expect("Failed to open finder");
    } else {
        Command::new("xdg-open")
            .args([path])
            .spawn()
            .expect("Failed to open file explorer");
    }

    Ok(())
}