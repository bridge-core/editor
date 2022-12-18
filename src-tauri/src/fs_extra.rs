use std::path::Path;
use std::process::Command;
use std::{fs, io};
use tokio::fs::File;
use tokio::io::AsyncReadExt;

pub fn copy_dir_all(src: impl AsRef<Path>, dest: impl AsRef<Path>) -> io::Result<()> {
    fs::create_dir_all(&dest)?;

    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let file_type = entry.file_type()?;

        if file_type.is_dir() {
            copy_dir_all(entry.path(), dest.as_ref().join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dest.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
}

/**
 * Copy a directory from src to dest
 */
#[tauri::command]
pub fn copy_directory(src: String, dest: String) -> Result<(), String> {
    copy_dir_all(src, dest).map_err(|e| e.to_string())
}

/**
 * Opens a file in the file explorer
 */
#[tauri::command]
pub async fn reveal_in_file_explorer(path: &str) -> Result<(), String> {
    if cfg!(target_os = "windows") {
        Command::new("explorer")
            .args(["/select,", path]) // The comma after select is not a typo
            .spawn()
            .expect("Failed to open file explorer");
    } else if cfg!(target_os = "macos") {
        Command::new("open")
            .args(["-R", path])
            .spawn()
            .expect("Failed to open finder");
    } else {
        // TODO: Linux
    }

    Ok(())
}

/**
 * A function that returns when a file was last modified and its file data
 */
#[tauri::command]
pub async fn get_file_data(path: &str) -> Result<(u64, Vec<u8>), String> {
    let metadata = fs::metadata(path).expect("Failed to get file metadata");
    let modified = metadata
        .modified()
        .expect("Failed to get file modified time")
        .duration_since(std::time::UNIX_EPOCH)
        .expect("Time went backwards")
        .as_secs();
    let data = fs::read(path).expect("Failed to read file");

    Ok((modified, data))
}

/**
 * A faster way to read a binary file compared to Tauri's built-in read_file
 */
#[tauri::command]
pub async fn read_file(path: &str) -> Result<Vec<u8>, String> {
    let file_result = File::open(path).await;
    if file_result.is_err() {
        return Err(file_result.err().unwrap().to_string());
    }
    let mut file = file_result.unwrap();

    let mut contents = vec![];
    let read_result = file.read_to_end(&mut contents).await;

    if read_result.is_err() {
        return Err(read_result.err().unwrap().to_string());
    }

    Ok(contents)
}
