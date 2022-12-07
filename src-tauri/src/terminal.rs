use std::collections::HashMap;
/**
 * Backend for bridge.'s terminal
 */
use std::env;
use std::path::PathBuf;
use std::process::Stdio;
use std::sync::Arc;
use tokio::{
    io::{AsyncBufReadExt, BufReader},
    process::Command,
    sync::Mutex,
};

// Manager extends Mutex to allow for thread-safe acces
#[derive(Default)]
pub struct AllTerminals(pub Arc<Mutex<HashMap<String, String>>>);

#[derive(Clone, serde::Serialize)]
struct MessagePayload {
    // Kind is either stdout or stderr
    message: String,
}

#[tauri::command]
pub async fn execute_command(
    window: tauri::Window,
    state: tauri::State<'_, AllTerminals>,
    cwd: String,
    command: String,
) -> Result<(), String> {
    // Set the current working directory
    let cwd_path = PathBuf::from(cwd);
    env::set_current_dir(&cwd_path).expect("Failed to set cwd");

    let mut all_terminals = state.0.lock().await;
    // This can be changed to take a dynamic key in the future in order to support multiple terminals
    let maybe_child_id = all_terminals.get_mut(&*"current_child");

    // Kill current child
    if let Some(child_id) = maybe_child_id {
        kill_process_with_id(child_id.to_string())
    }

    // Spawn command
    let mut child = if cfg!(target_os = "windows") {
        Command::new("cmd")
            .kill_on_drop(true)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .args(["/C", &command])
            .spawn()
            .expect("Failed to spawn command")
    } else {
        Command::new("sh")
            .kill_on_drop(true)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .args(["-c", &command])
            .spawn()
            .expect("Failed to spawn command")
    };

    let stdout = child
        .stdout
        .take()
        .expect("Child did not have a handle to stdout");
    let stderr = child
        .stderr
        .take()
        .expect("Child did not have a handle to stderr");

    let mut stdout_reader = BufReader::new(stdout).lines();
    let mut stderr_reader = BufReader::new(stderr).lines();

    let window_stderr = window.clone();
    let window_done = window.clone();

    tokio::spawn(async move {
        while let Some(line) = stdout_reader
            .next_line()
            .await
            .expect("Failed to read line")
        {
            window
                .emit("onStdoutMessage", MessagePayload { message: line })
                .expect("Failed to emit message");
        }
    });
    tokio::spawn(async move {
        while let Some(line) = stderr_reader
            .next_line()
            .await
            .expect("Failed to read line")
        {
            window_stderr
                .emit("onStderrMessage", MessagePayload { message: line })
                .expect("Failed to emit message");
        }
    });

    all_terminals.insert(
        "current_child".to_string(),
        child.id().expect("Failed to get child id").to_string(),
    );
    tokio::spawn(async move {
        child.wait().await.expect("Failed to wait on child process");
        window_done
            .emit("onCommandDone", ())
            .expect("Failed to emit message");
    });

    Ok(())
}

#[tauri::command]
pub async fn kill_command(state: tauri::State<'_, AllTerminals>) -> Result<(), String> {
    let mut all_terminals = state.0.lock().await;
    // This can be changed to take a dynamic key in the future in order to support multiple terminals
    let maybe_child_id = all_terminals.get_mut(&*"current_child");

    // Kill current child
    if let Some(child_id) = maybe_child_id {
        kill_process_with_id(child_id.to_string())
    }

    // Remove child from hashmap
    all_terminals.remove(&*"current_child");

    Ok(())
}

fn kill_process_with_id(id: String) {
    if cfg!(target_os = "windows") {
        std::process::Command::new("taskkill")
            .args(["/F", "/PID", &id])
            .output()
            .expect("Failed to kill process");
    } else {
        std::process::Command::new("kill")
            .args([&id])
            .output()
            .expect("Failed to kill process");
    }
}
