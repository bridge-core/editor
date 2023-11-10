use std::{path::Path, sync::Mutex};

use notify::{RecommendedWatcher, RecursiveMode, Watcher};
use tauri::Manager;

pub fn create_watcher(app_handle: tauri::AppHandle) -> RecommendedWatcher {
    return notify::recommended_watcher(move |res: Result<notify::Event, _>| match res {
        Ok(path) => {
            let paths: Vec<String> = path
                .paths
                .iter()
                .map(|p| {
                    let full_path = p.to_str().unwrap();
                    let app_data_path = app_handle
                        .path_resolver()
                        .app_local_data_dir()
                        .unwrap()
                        .join("bridge");
                    let fixed_app_data_path = app_data_path.canonicalize().unwrap();
                    let app_data_path_string = fixed_app_data_path.to_str().unwrap();
                    let resolved_path = full_path.strip_prefix(app_data_path_string).unwrap();
                    let mut normalized_path = resolved_path.replace("\\", "/");

                    if normalized_path.starts_with("/") {
                        normalized_path = normalized_path[1..].to_string();
                    }

                    return normalized_path;
                })
                .collect();

            app_handle.emit_all("watch_event", paths).unwrap();

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
        .canonicalize();

    match resolved_path {
        Ok(resolved_path) => {
            let mut watcher_option = state.lock().unwrap();
            let watcher = watcher_option.as_mut().unwrap();

            watcher
                .watch(&resolved_path, RecursiveMode::Recursive)
                .unwrap();
        }
        Err(error) => (),
    }
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
        .canonicalize();

    match resolved_path {
        Ok(resolved_path) => {
            let mut watcher_option = state.lock().unwrap();
            let watcher = watcher_option.as_mut().unwrap();

            watcher.unwatch(&resolved_path).unwrap();
        }
        Err(error) => (),
    }
}
