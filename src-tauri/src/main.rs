#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::Mutex;

use notify::RecommendedWatcher;
use tauri::{Manager, Menu};
use terminal::AllTerminals;
use window_shadows::set_shadow;
mod discord;
mod fs_extra;
mod terminal;
mod watch;
mod zip;

fn main() {
    let mut menu = Menu::os_default(&"bridge. v2");

    if cfg!(target_os = "windows") {
        menu = Menu::new()
    }

    tauri::Builder::default()
        .manage::<AllTerminals>(AllTerminals(Default::default()))
        .manage::<Mutex<Option<RecommendedWatcher>>>(Mutex::new(None))
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
            match discord::set_rich_presence(&main_window) {
                Ok(_) => {
                    println!("Rich presence set!");
                }
                Err(e) => {
                    println!("Error setting rich presence: {}", e);
                }
            };

            let watcher_state = app.state::<Mutex<Option<RecommendedWatcher>>>();

            let mut watcher = watcher_state.lock().unwrap();

            watcher.insert(watch::create_watcher(app.app_handle()));

            Ok(())
        })
        .menu(menu)
        .invoke_handler(tauri::generate_handler![
            fs_extra::reveal_in_file_explorer,
            fs_extra::get_file_metadata,
            fs_extra::copy_directory,
            fs_extra::read_file,
            terminal::execute_command,
            terminal::kill_command,
            zip::unzip_command,
            zip::zip_command,
            watch::watch_folder,
            watch::unwatch_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
