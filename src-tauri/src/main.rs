// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};

use notify::RecommendedWatcher;
use tauri::Manager;
use window_shadows::set_shadow;

mod watch;

fn main() {
    let watcher_mutex: Arc<Mutex<Option<RecommendedWatcher>>> = Arc::new(Mutex::new(None));

    let app_watcher_mutex = watcher_mutex.clone();
    tauri::Builder::default()
        .setup(move |app| {
            let window = app.get_window("main").unwrap();

            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                window.open_devtools();
                // window.close_devtools();
            }

            if cfg!(target_os = "windows") {
                set_shadow(&window, true).expect("Unable to set window shadow");
            }

            let mut watcher = app_watcher_mutex.lock().unwrap();
            *watcher = watch::setup_watcher(app.handle());

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
