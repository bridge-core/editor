#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{Menu, Manager};
use discord_rich_presence::{activity, DiscordIpc, DiscordIpcClient};
use std::process::Command;

#[tauri::command]
async fn show_in_file_explorer(path: &str) -> Result<(), String> {
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
        panic!("Unsupported OS");
    }

    Ok(())
}

fn main() {
    let menu = Menu::os_default(&"bridge. v2");

    tauri::Builder::default()
        .setup(|app| {
            // `main` here is the window label; it is defined under `tauri.conf.json`
            let main_window = app.get_window("main").unwrap();

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
        .invoke_handler(tauri::generate_handler![show_in_file_explorer])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    
}

fn set_rich_presence() -> Result<DiscordIpcClient, Box<dyn std::error::Error>> {
    let mut client = DiscordIpcClient::new("1045743881393815552")?;
    
    client.connect()?;
    client.set_activity(activity::Activity::new()
        .state("Developing add-ons...")
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