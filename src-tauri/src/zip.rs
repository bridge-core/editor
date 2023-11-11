use std::collections::HashMap;
use std::io::{Cursor, Read, Write};
use zip::write::FileOptions;
use zip::CompressionMethod;
use zip::ZipArchive;
use zip::ZipWriter;

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

#[tauri::command]
pub fn zip_command(files: HashMap<String, Vec<u8>>) -> Vec<u8> {
    let mut data: Vec<u8> = Vec::new();

    {
        let writer = Cursor::new(&mut data);

        let mut zip = ZipWriter::new(writer);

        let options = FileOptions::default().compression_method(CompressionMethod::DEFLATE);

        for (path, data) in files {
            zip.start_file(path, options).unwrap();
            zip.write_all(&data).unwrap();
        }

        zip.finish().unwrap();
    }

    return data;
}
