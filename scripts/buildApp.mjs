import { build } from 'vite'

if (process.argv[2] === '--tauri') {
	process.env.VITE_IS_TAURI_APP = true
}

build()
