import { ThemeManager } from '@/libs/theme/ThemeManager'
import { LocaleManager } from '@/libs/locales/Locales'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { Data } from '@/libs/data/Data'
import { TauriFileSystem } from '@/libs/fileSystem/TauriFileSystem'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { appDataDir, appLocalDataDir, sep } from '@tauri-apps/api/path'
import { join } from '@/libs/path'
import { setupActions } from '@/libs/actions/Actions'
import { setupTypescript } from '@/libs/monaco/TypeScript'
import { Settings } from '@/libs/settings/Settings'
import { TextTab } from '@/components/Tabs/Text/TextTab'
import { Extensions } from '@/libs/extensions/Extensions'
import { Toolbar } from '@/components/Toolbar/Toolbar'
import { setupSidebar } from '@/components/Sidebar/SidebarSetup'
import { Sidebar } from '@/components/Sidebar/Sidebar'

export function setupBeforeComponents() {
	ProjectManager.setup()
	ThemeManager.setup()
	LocaleManager.setup()
	Extensions.setup()
	Toolbar.setup()
	TextTab.setup()
	Sidebar.setup()

	setupActions()
	setupSidebar()
}

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
