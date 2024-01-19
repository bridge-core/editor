import { tauriBuild } from '@/libs/tauri/Tauri'
import { BaseFileSystem } from './BaseFileSystem'
import { PWAFileSystem } from './PWAFileSystem'
import { TauriFileSystem } from './TauriFileSystem'

export function getFileSystem(): BaseFileSystem {
	if (tauriBuild) return new TauriFileSystem()

	return new PWAFileSystem()
}
