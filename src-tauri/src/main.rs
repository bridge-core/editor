#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{Menu, Manager};
use discord_rich_presence::{activity, DiscordIpc, DiscordIpcClient};
use std::process::Command;
use window_shadows::set_shadow;

#[tauri::command]
async fn reveal_in_file_explorer(path: &str) -> Result<(), String> {
    if cfg!(target_os = "windows") {
        Command::new("explorer")
            .args(["/select,", path]) // The comma after select is not a typo
            .spawn()
            .expect("Failed to open file explorer");
    } else if cfg!(target_os = "macos") {
        Command::new( "open" )
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
async fn get_file_data(path: &str) -> Result<(u64, Vec<u8>), String> {
    let metadata = std::fs::metadata(path).expect("Failed to get file metadata");
    let modified = metadata.modified().expect("Failed to get file modified time").duration_since(std::time::UNIX_EPOCH).expect("Time went backwards").as_secs();
    let data = std::fs::read(path).expect("Failed to read file");

    Ok((modified, data))
}

fn main() {
    let mut menu = Menu::os_default(&"bridge. v2");

    if cfg!(target_os = "windows") {
        menu = Menu::new()
    }

    tauri::Builder::default()
        .setup(|app| {
            // `main` here is the window label; it is defined under `tauri.conf.json`
            let main_window = app.get_window("main").unwrap();

            if cfg!(target_os = "windows") {
                set_shadow(&main_window, true).expect("Unable to set window shadow");
            }

            // Try to set Discord rich presence
            match set_rich_presence() {
                Ok(mut discord_client) => {
                    println!("Rich presence set!");
                    
                    // listen to "tauri://destroyed" (emitted on the `main` window)
                    main_window.once("tauri://destroyed", move |_| {
                        println!("Window closes!");
                        discord_client.close().expect("Failed to close Discord IPC");
                    });
                }
                Err(e) => {
                    println!("Error setting rich presence: {}", e);
                }
            };           
      
            Ok(())
        })
        .menu(menu)
        .invoke_handler(tauri::generate_handler![reveal_in_file_explorer, get_file_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    
}

fn set_rich_presence() -> Result<DiscordIpcClient, Box<dyn std::error::Error>> {
    let mut client = DiscordIpcClient::new("1045743881393815552")?;
    
    let state_str = "Developing add-ons...";

    client.connect()?;
    client.set_activity(activity::Activity::new()
        .state(state_str)
        .assets(activity::Assets::new()
            .large_image("logo_tile")
            .large_text("bridge. v2")
        )
        .timestamps(activity::Timestamps::new()
            .start(chrono::Utc::now().timestamp_millis())
        )
        .buttons(vec![
            activity::Button::new("Open Editor", "https://editor.bridge-core.app/"),
            // activity::Button::new("Read More...", "https://bridge-core.app/"),
        ])
    )?;

    Ok(client)
}