// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};

use notify::RecommendedWatcher;
use tauri::Manager;

mod fs_extra;
mod watch;

fn main() {
    let watcher_mutex: Arc<Mutex<Option<RecommendedWatcher>>> = Arc::new(Mutex::new(None));

    let app_watcher_mutex = watcher_mutex.clone();
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(watcher_mutex)
        .invoke_handler(tauri::generate_handler![
            watch::watch,
            watch::unwatch,
            fs_extra::reveal_in_file_explorer,
        ])
        .setup(move |app| {
            #[cfg(debug_assertions)]
            app.get_webview_window("main").unwrap().open_devtools();

            let mut watcher = app_watcher_mutex.lock().unwrap();
            *watcher = watch::setup_watcher(app.handle().clone());

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
