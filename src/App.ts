import { Toolbar } from '@/components/Toolbar/Toolbar'
import { ThemeManager } from '@/libs/theme/ThemeManager'
import { LocaleManager } from '@/libs/locales/Locales'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { getFileSystem } from '@/libs/fileSystem/FileSystem'
import { Data } from '@/libs/data/Data'
import { Windows } from '@/components/Windows/Windows'
import { TabManager } from '@/components/TabSystem/TabManager'
import { Sidebar } from '@/components/Sidebar/Sidebar'
import { FileExplorer } from '@/components/FileExplorer/FileExplorer'
import { Settings } from '@/components/Windows/Settings/Settings'
import { ConfirmWindow } from '@/components/Windows/Confirm/ConfirmWindow'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { TauriFileSystem } from '@/libs/fileSystem/TauriFileSystem'
import { get, set } from 'idb-keyval'
import { appDataDir, appLocalDataDir, sep } from '@tauri-apps/api/path'
import { join } from './libs/path'

export const toolbar = new Toolbar()
export const themeManager = new ThemeManager()
export const projectManager = new ProjectManager()
export const fileSystem = getFileSystem()
export const data = new Data()
export const windows = new Windows()
export const tabManager = new TabManager()
export const sidebar = new Sidebar()
export const fileExplorer = new FileExplorer()
export const settings = new Settings()
export const confirmWindow = new ConfirmWindow()

export async function setup() {
	console.time('[App] Setup')

	fileSystem.eventSystem.on('reloaded', () => {
		console.time('[App] Projects')
		projectManager.loadProjects()
		console.timeEnd('[App] Projects')
	})

	if (fileSystem instanceof TauriFileSystem) await setupTauriFileSystem()

	console.time('[App] Locale')
	await LocaleManager.applyDefaultLanguage()
	console.timeEnd('[App] Locale')

	console.time('[App] Settings')
	await settings.load()
	console.timeEnd('[App] Settings')

	console.time('[App] Projects')
	await projectManager.loadProjects()
	console.timeEnd('[App] Projects')

	console.time('[App] Data')
	await data.load()
	console.timeEnd('[App] Data')

	console.timeEnd('[App] Setup')
}

async function setupTauriFileSystem() {
	if (!(fileSystem instanceof TauriFileSystem)) return

	const basePath = join(await (await appDataDir()).replaceAll(sep, '/'), 'bridge/')

	fileSystem.setBasePath(basePath)

	await fileSystem.ensureDirectory('/')

	fileSystem.startFileWatching()
}

export async function selectOrLoadBridgeFolder() {
	if (!(fileSystem instanceof PWAFileSystem)) return

	const savedHandle: undefined | FileSystemDirectoryHandle = await get('bridgeFolderHandle')

	if (!fileSystem.baseHandle && savedHandle && (await fileSystem.ensurePermissions(savedHandle))) {
		fileSystem.setBaseHandle(savedHandle)

		return
	}

	try {
		fileSystem.setBaseHandle(
			(await window.showDirectoryPicker({
				mode: 'readwrite',
			})) ?? null
		)

		set('bridgeFolderHandle', fileSystem.baseHandle)
	} catch {}
}
