use std::collections::HashMap;
use std::io::{Cursor, Read};
use zip::ZipArchive;

#[tauri::command]
pub fn unzip_command(data: Vec<u8>) -> HashMap<String, Vec<u8>> {
    let mut zip_file = Cursor::new(data);
    let mut archive = ZipArchive::new(&mut zip_file).unwrap();

    let mut unzipped_data: HashMap<String, Vec<u8>> = HashMap::new();

    for index in 0..archive.len() {
        let mut file = archive.by_index(index).unwrap();

        let mut buffer: Vec<u8> = Vec::new();
        file.read_to_end(&mut buffer).unwrap();

        unzipped_data.insert(String::from(file.name()), buffer);
    }

    return unzipped_data;
}
