use notify::{RecommendedWatcher, RecursiveMode, Watcher};
use tauri::Manager;

pub fn setup_watcher(app_handle: tauri::AppHandle) -> Option<RecommendedWatcher> {
    let app_handle_clone = app_handle.clone();

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
        Ok(mut watcher) => {
            match app_handle_clone.path_resolver().app_data_dir() {
                Some(path) => {
                    if watcher.watch(&path, RecursiveMode::Recursive).is_err() {
                        eprintln!("Failed to watch local data directory!");
                    }
                }
                None => {
                    eprintln!("Failed to find local data directory!");
                }
            }

            Some(watcher)
        }
        Err(error) => {
            eprintln!("Failed to setup watcher: {}", error);

            None
        }
    };
}
