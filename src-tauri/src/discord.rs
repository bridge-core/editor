use discord_rich_presence::{activity, DiscordIpc, DiscordIpcClient};
use std::sync::{Arc, Mutex};

#[derive(Clone, serde::Deserialize)]
struct RichPresencePayload {
    state: String,
    details: String,
}

pub fn set_rich_presence(window: &tauri::Window) -> Result<(), Box<dyn std::error::Error>> {
    let client = Arc::new(Mutex::new(DiscordIpcClient::new("1045743881393815552")?));

    let success = client.lock().unwrap().connect();

    // Discord RPC is working
    if let Ok(_) = success {
        window.listen("setRichPresence", move |event: tauri::Event| {
            let maybe_payload = event.payload();
            if let None = maybe_payload {
                println!("No payload for rich presence event");
                return ();
            }

            let payload = serde_json::from_str::<RichPresencePayload>(maybe_payload.unwrap());
            match payload {
                Ok(payload) => {
                    let _ = client.clone().lock().unwrap().set_activity(
                        activity::Activity::new()
                            .state(&payload.state)
                            .details(&payload.details)
                            .assets(
                                activity::Assets::new()
                                    .large_image("logo_tile")
                                    .large_text("bridge. v2"),
                            )
                            .timestamps(
                                activity::Timestamps::new()
                                    .start(chrono::Utc::now().timestamp_millis()),
                            )
                            .buttons(vec![
                                activity::Button::new(
                                    "Open Editor",
                                    "https://editor.bridge-core.app/",
                                ),
                                // activity::Button::new("Read More...", "https://bridge-core.app/"),
                            ]),
                    );
                }
                Err(e) => {
                    println!("Error parsing rich presence payload: {}", e);
                }
            }

            ()
        });
    }

    Ok(())
}
