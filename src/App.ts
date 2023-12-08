import { Toolbar } from '@/components/Toolbar/Toolbar'
import { ThemeManager } from '@/libs/theme/ThemeManager'
import { setupLanguageWorkers } from '@/libs/monaco/Monaco'
import { LocaleManager } from '@/libs/locales/Locales'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { getFileSystem } from '@/libs/fileSystem/FileSystem'
import { Data } from '@/libs/data/Data'
import { Windows } from '@/components/Windows/Windows'
import { TabManager } from '@/components/TabSystem/TabManager'
import { Sidebar } from '@/components/Sidebar/Sidebar'
import { FileExplorer } from '@/components/FileExplorer/FileExplorer'
import { Settings } from '@/components/Windows/Settings/Settings'

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

export async function setup() {
	console.time('[App] Setup')

	console.time('[App] Language Workers')
	setupLanguageWorkers()
	console.timeEnd('[App] Language Workers')

	fileSystem.eventSystem.on('reloaded', () => {
		console.time('[App] Projects')
		projectManager.loadProjects()
		console.timeEnd('[App] Projects')
	})

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
