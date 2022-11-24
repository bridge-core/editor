/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_IS_TAURI_APP: string
	// more env variables...
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
