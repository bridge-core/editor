import { tauriBuild } from '@/libs/tauri/Tauri'
import { BaseEntry, BaseFileSystem } from './BaseFileSystem'
import { PWAFileSystem } from './PWAFileSystem'
import { TauriFileSystem } from './TauriFileSystem'
import { get, set } from 'idb-keyval'
import { LocalFileSystem } from './LocalFileSystem'

export function getFileSystem(): BaseFileSystem {
	if (tauriBuild) return new TauriFileSystem()

	if (!supportsFileSystemApi()) return new LocalFileSystem()

	return new PWAFileSystem()
}

export const fileSystem = getFileSystem()

export async function selectOrLoadBridgeFolder() {
	if (!(fileSystem instanceof PWAFileSystem)) return

	const savedHandle: undefined | FileSystemDirectoryHandle = await get('bridgeFolderHandle')

	if (!fileSystem.baseHandle && savedHandle && (await fileSystem.ensurePermissions(savedHandle))) {
		fileSystem.setBaseHandle(savedHandle)

		return
	}

	try {
		//No mobile detection support?
		fileSystem.setBaseHandle(
			(await window.showDirectoryPicker({
				mode: 'readwrite',
			})) ?? null
		)

		await set('bridgeFolderHandle', fileSystem.baseHandle)
	} catch {}
}

export async function iterateDirectory(
	fileSystem: BaseFileSystem,
	path: string,
	callback: (entry: BaseEntry) => void | Promise<void>
) {
	for (const entry of await fileSystem.readDirectoryEntries(path)) {
		if (entry.kind === 'directory') {
			await iterateDirectory(fileSystem, entry.path, callback)
		} else {
			await callback(entry)
		}
	}
}

export async function iterateDirectoryParrallel(
	fileSystem: BaseFileSystem,
	path: string,
	callback: (entry: BaseEntry) => void | Promise<void>,
	ignoreFolders: Set<string> = new Set()
) {
	const promises = []

	for (const entry of await fileSystem.readDirectoryEntries(path)) {
		if (entry.kind === 'directory') {
			if (!ignoreFolders.has(entry.path)) promises.push(iterateDirectory(fileSystem, entry.path, callback))
		} else {
			promises.push(callback(entry))
		}
	}

	await Promise.all(promises)
}

/**
 * Chrome 93 and 94 crash when we try to call createWritable on a file handle inside of a web worker
 * We therefore enable this polyfill to work around the bug
 *
 * Additionally, Brave, Opera and similar browsers do not support the FileSystem API so we enable
 * the polyfill for all browsers which are not Chrome or Edge
 * (Brave and Opera still have the API methods but they're NOOPs so our detection doesn't work)
 */
function supportsFileSystemApi() {
	const unsupportedChromeVersions = ['93', '94']

	// @ts-ignore: TypeScript doesn't know about userAgentData yet
	const userAgentData: any = navigator.userAgentData
	if (!userAgentData) return false

	if (typeof window.showDirectoryPicker !== 'function') return false

	const chromeBrand = userAgentData.brands.find(({ brand }: any) => brand === 'Google Chrome')

	if (chromeBrand) return !unsupportedChromeVersions.includes(chromeBrand.version)

	const edgeBrand = userAgentData.brands.find(({ brand }: any) => brand === 'Microsoft Edge')

	if (edgeBrand) return true

	return false
}
