use std::{path::Path, ptr::null, sync::Mutex};

use notify::{RecommendedWatcher, RecursiveMode, Watcher};
use tauri::Manager;

pub fn create_watcher(app_handle: tauri::AppHandle) -> RecommendedWatcher {
    return notify::recommended_watcher(move |res| match res {
        Ok(event) => {
            app_handle.emit_all("watch_event", "event");

            return;
        }
        Err(e) => println!("watch error: {:?}", e),
    })
    .unwrap();
}

#[tauri::command]
pub fn watch_folder(
    path: String,
    state: tauri::State<Mutex<Option<RecommendedWatcher>>>,
    app_handle: tauri::AppHandle,
) {
    let resolved_path = app_handle
        .path_resolver()
        .app_local_data_dir()
        .unwrap()
        .join("bridge")
        .join(Path::new(&path))
        .canonicalize()
        .unwrap();

    println!("watching {:?}", resolved_path);

    let mut watcher_option = state.lock().unwrap();
    let watcher = watcher_option.as_mut().unwrap();

    watcher
        .watch(&resolved_path, RecursiveMode::Recursive)
        .unwrap();
}

#[tauri::command]
pub fn unwatch_folder(
    path: String,
    state: tauri::State<Mutex<Option<RecommendedWatcher>>>,
    app_handle: tauri::AppHandle,
) {
    let resolved_path = app_handle
        .path_resolver()
        .app_local_data_dir()
        .unwrap()
        .join("bridge")
        .join(Path::new(&path))
        .canonicalize()
        .unwrap();

    println!("unwatch {:?}", resolved_path);

    let mut watcher_option = state.lock().unwrap();
    let watcher = watcher_option.as_mut().unwrap();

    watcher.unwatch(&resolved_path).unwrap();
}
