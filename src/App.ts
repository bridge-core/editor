import AppComponent from './App.vue'
import { ProjectManager } from '/@/libs/projects/ProjectManager'
import { ThemeManager } from '/@/components/Extensions/Themes/ThemeManager'
import { getFileSystem } from '/@/libs/fileSystem/FileSystem'
import { createApp } from 'vue'
import { Windows } from '/@/components/Windows/Windows'
import { Data } from '/@/libs/data/Data'
import { Sidebar } from '/@/components/Editor/Sidebar/Sidebar'
import { FileExplorer } from '/@/components/Editor/FileExplorer/FileExplorer'
import { Toolbar } from '/@/components/Toolbar/Toolbar'
import { Settings } from '/@/components/Windows/Settings/Settings'

export class App {
	public static instance: App

	public fileSystem = getFileSystem()
	public projectManager = new ProjectManager()
	public windows = new Windows()
	public data = new Data()
	public sidebar = new Sidebar()
	public fileExplorer = new FileExplorer()
	public toolbar = new Toolbar()
	public settings = new Settings()

	protected themeManager = new ThemeManager()

	get projectSelected() {
		return false
	}

	public static async main() {
		console.time('[APP] Ready')

		this.instance = new App()
		await this.instance.setup()

		console.timeEnd('[APP] Ready')
	}

	protected async setup() {
		this.fileSystem.eventSystem.on('reloaded', () => {
			this.projectManager.loadProjects()
		})

		console.time('[App] Settings')
		await this.settings.load()
		console.timeEnd('[App] Settings')

		console.time('[App] Projects')
		await this.projectManager.loadProjects()
		console.timeEnd('[App] Projects')

		console.time('[App] Data')
		await this.data.load()
		console.timeEnd('[App] Data')

		createApp(AppComponent).mount('#app')
	}
}
