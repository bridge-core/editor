#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use discord_rich_presence::{activity, DiscordIpc, DiscordIpcClient};
use tauri::{Manager, Menu};
use terminal::AllTerminals;
use window_shadows::set_shadow;
mod fs_extra;
mod terminal;

fn main() {
    let mut menu = Menu::os_default(&"bridge. v2");

    if cfg!(target_os = "windows") {
        menu = Menu::new()
    }

    tauri::Builder::default()
        .manage::<AllTerminals>(AllTerminals(Default::default()))
        .setup(|app| {
            // `main` here is the window label; it is defined under `tauri.conf.json`
            let main_window = app.get_window("main").unwrap();

            if cfg!(target_os = "windows") {
                set_shadow(&main_window, true).expect("Unable to set window shadow");
            }

            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                main_window.open_devtools();
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
        .invoke_handler(tauri::generate_handler![
            fs_extra::reveal_in_file_explorer,
            fs_extra::get_file_last_modified,
            fs_extra::copy_directory,
            fs_extra::read_file,
            terminal::execute_command,
            terminal::kill_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn set_rich_presence() -> Result<DiscordIpcClient, Box<dyn std::error::Error>> {
    let mut client = DiscordIpcClient::new("1045743881393815552")?;

    let state_str = "Developing add-ons...";

    client.connect()?;
    client.set_activity(
        activity::Activity::new()
            .state(state_str)
            .assets(
                activity::Assets::new()
                    .large_image("logo_tile")
                    .large_text("bridge. v2"),
            )
            .timestamps(activity::Timestamps::new().start(chrono::Utc::now().timestamp_millis()))
            .buttons(vec![
                activity::Button::new("Open Editor", "https://editor.bridge-core.app/"),
                // activity::Button::new("Read More...", "https://bridge-core.app/"),
            ]),
    )?;

    Ok(client)
}
