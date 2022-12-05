/**
 * Backend for bridge.'s terminal
 */
use std::env;
use std::path::PathBuf;
use async_process::Command;

#[tauri::command]
pub async fn execute_command(cwd: String, command: String) -> Result<(String, String), String> {
    // Set the current working directory
    let cwd_path = PathBuf::from(cwd);

    env::set_current_dir(&cwd_path)
        .expect("Failed to set cwd");


    // Spawn command
    let output = if cfg!(target_os = "windows") {
        Command::new("cmd")
            .args(["/C", &command])
            .output()
            .await
            .expect(&format!("Failed to execute command \"{}\"", command))
    } else {
        Command::new("sh")
            .arg("-c")
            .arg(&command)
            .output()
            .await
            .expect(&format!("Failed to execute command \"{}\"", command))
    };


    let output_string = String::from_utf8(output.stdout)
        .expect("Failed to convert output to string");
    let stderr_string = String::from_utf8(output.stderr)
        .expect("Failed to convert stderr to string");

    Ok((output_string, stderr_string))
}