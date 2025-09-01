import { ThemeManager } from '@/libs/theme/ThemeManager'
import { LocaleManager } from '@/libs/locales/Locales'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { Data } from '@/libs/data/Data'
import { TauriFileSystem } from '@/libs/fileSystem/TauriFileSystem'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { appDataDir, appLocalDataDir, sep } from '@tauri-apps/api/path'
import { join } from 'pathe'
import { setupActions } from '@/libs/actions/Actions'
import { setupTypescript } from '@/libs/monaco/TypeScript'
import { Settings } from '@/libs/settings/Settings'
import { TextTab } from '@/components/Tabs/Text/TextTab'
import { Extensions } from '@/libs/extensions/Extensions'
import { Toolbar } from '@/components/Toolbar/Toolbar'
import { setupSidebar } from '@/components/Sidebar/SidebarSetup'
import { Sidebar } from '@/components/Sidebar/Sidebar'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { setupLang } from '@/libs/monaco/languages/Lang'
import { setupMcFunction } from '@/libs/monaco/languages/McFunction/Language'
import { setupMolang } from '@/libs/monaco/languages/Molang'
import { setupSnippetCompletions } from '@/libs/monaco/SnippetCompletions'
import { LocalFileSystem } from '@/libs/fileSystem/LocalFileSystem'
import { NotificationSystem } from '@/components/Notifications/NotificationSystem'
import { setupModules } from '@/libs/extensions/Modules'
import { setupEditorSettings, setupGeneralSettings } from '@/libs/settings/SetupSettings'
import { TreeEditorTab } from '@/components/Tabs/TreeEditor/TreeEditorTab'
import { tauriBuild } from '@/libs/tauri/Tauri'
import { setupImporters } from '@/libs/import/Importers'
import { TabManager } from '@/components/TabSystem/TabManager'
import { FileExplorer } from '@/components/FileExplorer/FileExplorer'
import { CreateProjectWindow } from '@/components/Windows/CreateProject/CreateProjectWindow'
import { TabTypes } from '@/components/TabSystem/TabTypes'
import { setupExportActions } from '@/libs/actions/export/ExportActions'
import { setupFileActions } from '@/libs/actions/file/FileActions'
import { ReportErrorWindow } from '@/components/Windows/ReportError/ReportErrorWindow'
import { setupTabActions } from '@/libs/actions/tab/TabActions'

export function setupBeforeComponents() {
	NotificationSystem.setup()
	ProjectManager.setup()
	ThemeManager.setup()
	LocaleManager.setup()
	Extensions.setup()
	Toolbar.setup()
	TextTab.setup()
	TreeEditorTab.setup()
	Sidebar.setup()
	TabTypes.setup()
	TabManager.setup()
	FileExplorer.setup()
	CreateProjectWindow.setup()

	setupSidebar()

	setupGeneralSettings()
	setupEditorSettings()

	setupModules()

	setupImporters()

	setupExportActions()
	setupFileActions()
	setupTabActions()
}

export async function setup() {
	console.time('[App] Setup')

	ReportErrorWindow.setup()

	ThemeManager.load()
	LocaleManager.applyDefaultLanguage()

	if (fileSystem instanceof PWAFileSystem)
		fileSystem.reloaded.on(() => {
			console.time('[App] Projects')
			ProjectManager.loadProjects()
			console.timeEnd('[App] Projects')
		})

	if (fileSystem instanceof TauriFileSystem) await setupTauriFileSystem()

	if (fileSystem instanceof LocalFileSystem) fileSystem.setRootName('fileSystemPolyfill')

	setupTypescript()
	setupLang()
	setupMcFunction()
	setupMolang()
	setupSnippetCompletions()

	console.time('[App] Settings')
	await Settings.load()
	console.timeEnd('[App] Settings')

	setupActions()

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

if (tauriBuild) {
	// Import Tauri updater for native builds
	import('@/libs/tauri/Updater')
} else {
	// Only import service worker for non-Tauri builds
	import('@/libs/app/PWAServiceWorker')
}
