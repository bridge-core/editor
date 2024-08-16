use std::{
    path::Path,
    sync::{Arc, Mutex},
};

use notify::{RecommendedWatcher, RecursiveMode, Watcher};
use tauri::Manager;

pub fn setup_watcher(app_handle: tauri::AppHandle) -> Option<RecommendedWatcher> {
    return match notify::recommended_watcher(move |res: Result<notify::Event, _>| match res {
        Ok(event) => {
            let paths: Vec<String> = event
                .paths
                .iter()
                .map(|path| path.to_str().unwrap().replace("\\", "/"))
                .collect();

            app_handle.emit_all("watch_event", paths).unwrap();
        }
        Err(e) => println!("watch error: {:?}", e),
    }) {
        Ok(watcher) => Some(watcher),
        Err(error) => {
            eprintln!("Failed to setup watcher: {}", error);

            None
        }
    };
}

#[tauri::command]
pub fn watch(
    path: String,
    _app_handle: tauri::AppHandle,
    watcher_mutex: tauri::State<Arc<Mutex<Option<RecommendedWatcher>>>>,
) {
    println!("Watching {}", path);

    let path = Path::new(&path);

    if !path.is_absolute() {
        println!(
            "Can not watch path that is no absolute {}",
            path.to_str().unwrap()
        );

        return;
    }

    let mut watcher = watcher_mutex.lock().unwrap();
    let watcher = watcher.as_mut();
    let watcher = watcher.unwrap();

    watcher.watch(path, RecursiveMode::Recursive).unwrap();
}

#[tauri::command]
pub fn unwatch(
    path: String,
    _app_handle: tauri::AppHandle,
    watcher_mutex: tauri::State<Arc<Mutex<Option<RecommendedWatcher>>>>,
) {
    println!("Unwatching {}", path);

    let path = Path::new(&path);

    if !path.is_absolute() {
        println!(
            "Can not unwatch path that is no absolute {}",
            path.to_str().unwrap()
        );

        return;
    }

    let mut watcher = watcher_mutex.lock().unwrap();
    let watcher = watcher.as_mut();
    let watcher = watcher.unwrap();

    watcher.unwatch(path).unwrap();
}
