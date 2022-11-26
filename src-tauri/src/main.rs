#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{Menu, Manager};
use discord_rich_presence::{activity, DiscordIpc, DiscordIpcClient};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
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
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    
}

fn set_rich_presence() -> Result<DiscordIpcClient, Box<dyn std::error::Error>> {
    let mut client = DiscordIpcClient::new("1045743881393815552")?;
    
    client.connect()?;
    client.set_activity(activity::Activity::new()
        .state("Developing add-ons...")
        .assets(activity::Assets::new()
            .large_image("logo_normal")
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