import { BaseFileSystem } from './BaseFileSystem'
import { PWAFileSystem } from './PWAFileSystem'

export function getFileSystem(): BaseFileSystem {
	return new PWAFileSystem()
}
