use std::collections::HashMap;
/**
 * Backend for bridge.'s terminal
 */
use std::env;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::{
    io::BufReader,
    process::{Child, Command},
    sync::Mutex,
};

// Manager extends Mutex to allow for thread-safe acces
#[derive(Default)]
pub struct AllTerminals(pub Arc<Mutex<HashMap<String, Child>>>);

#[tauri::command]
pub async fn execute_command(
    state: tauri::State<'_, AllTerminals>,
    cwd: String,
    command: String,
) -> Result<(String, String), String> {
    // Set the current working directory
    let cwd_path = PathBuf::from(cwd);
    env::set_current_dir(&cwd_path).expect("Failed to set cwd");

    let mut all_terminals = state.0.lock().await;
    // This can be changed to take a dynamic key in the future in order to support multiple terminals
    let maybe_child = all_terminals.get_mut(&*"current_child");

    // Kill current child
    if let Some(child) = maybe_child {
        child.kill().await.expect("Failed to kill child");
    }

    // Spawn command
    let output = if cfg!(target_os = "windows") {
        Command::new("cmd")
            .args(["/C", &command])
            .output()
            .await
            .expect(&format!("Failed to execute command \"{}\"", command))
    } else {
        Command::new("sh")
            .args(["-c", &command])
            .output()
            .await
            .expect(&format!("Failed to execute command \"{}\"", command))
    };

    let output_string =
        String::from_utf8(output.stdout).expect("Failed to convert output to string");
    let stderr_string =
        String::from_utf8(output.stderr).expect("Failed to convert stderr to string");

    Ok((output_string, stderr_string))
}
