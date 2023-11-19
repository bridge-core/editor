import AppComponent from './App.vue'
import { ProjectManager } from '/@/libs/projects/ProjectManager'
import { ThemeManager } from '/@/components/Extensions/Themes/ThemeManager'
import { getFileSystem } from '/@/libs/fileSystem/FileSystem'
import { createApp } from 'vue'
import { Windows } from '/@/components/Windows/Windows'
import { Data } from '/@/libs/data/Data'
import { PWAFileSystem } from './libs/fileSystem/PWAFileSystem'
import { get, set } from 'idb-keyval'

export class App {
	public static instance: App

	public fileSystem = getFileSystem()
	public projectManager = new ProjectManager()
	public windows = new Windows()
	public data = new Data()

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

			if (this.fileSystem instanceof PWAFileSystem) {
				set('bridgeFolderHandle', this.fileSystem.baseHandle)
			}
		})

		console.time('[App] Projects')
		await this.projectManager.loadProjects()
		console.timeEnd('[App] Projects')

		console.time('[App] Data')
		await this.data.load()
		console.timeEnd('[App] Data')

		createApp(AppComponent).mount('#app')

		if (this.fileSystem instanceof PWAFileSystem) {
			const handle: undefined | FileSystemDirectoryHandle = await get(
				'bridgeFolderHandle'
			)

			if (handle) this.fileSystem.setBaseHandle(handle)
		}
	}
}
