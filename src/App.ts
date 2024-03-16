import { Toolbar } from '@/components/Toolbar/Toolbar'
import { ThemeManager } from '@/libs/theme/ThemeManager'
import { LocaleManager } from '@/libs/locales/Locales'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { Data } from '@/libs/data/Data'
import { Sidebar } from '@/components/Sidebar/Sidebar'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { TauriFileSystem } from '@/libs/fileSystem/TauriFileSystem'
import { get, set } from 'idb-keyval'
import { appDataDir, appLocalDataDir, sep } from '@tauri-apps/api/path'
import { join } from '@/libs/path'
import { setupActions } from '@/libs/actions/Actions'
import { setupTypescript } from '@/libs/monaco/TypeScript'
import { Settings } from '@/libs/settings/Settings'
import { TextTab } from '@/components/Tabs/Text/TextTab'
import { Extensions } from '@/libs/extensions/Extensions'

// Setup static singletons early so components can use them properly
ProjectManager.setup()
ThemeManager.setup()
LocaleManager.setup()
Extensions.setup()
Toolbar.setup()
TextTab.setup()
Sidebar.setup()

setupActions()

export async function setup() {
	console.time('[App] Setup')

	ThemeManager.load()
	LocaleManager.applyDefaultLanguage()

	fileSystem.eventSystem.on('reloaded', () => {
		console.time('[App] Projects')
		ProjectManager.loadProjects()
		console.timeEnd('[App] Projects')
	})

	if (fileSystem instanceof TauriFileSystem) await setupTauriFileSystem()

	setupTypescript()

	console.time('[App] Settings')
	await Settings.load()
	console.timeEnd('[App] Settings')

	console.time('[App] Data')
	await Data.load()
	console.timeEnd('[App] Data')

	console.time('[App] Projects')
	await ProjectManager.loadProjects()
	console.timeEnd('[App] Projects')

	console.time('[App] Extensions')
	await Extensions.load()
	console.timeEnd('[App] Extensions')

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

		fileSystem.startCache()

		return
	}

	try {
		fileSystem.setBaseHandle(
			(await window.showDirectoryPicker({
				mode: 'readwrite',
			})) ?? null
		)

		set('bridgeFolderHandle', fileSystem.baseHandle)

		fileSystem.startCache()
	} catch {}
}
