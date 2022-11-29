import { BaseDirectory, createDir } from '@tauri-apps/api/fs'

await createDir('', { dir: BaseDirectory.AppLocalData, recursive: true })
