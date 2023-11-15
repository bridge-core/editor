import AppComponent from './App.vue'
import { ProjectManager } from '/@/libs/projects/ProjectManager'
import { ThemeManager } from '/@/components/Extensions/Themes/ThemeManager'
import { getFileSystem } from '/@/libs/fileSystem/FileSystem'
import { Ref, createApp, ref } from 'vue'
import { ProjectData } from '/@/libs/projects/Project'
import { PWAFileSystem } from '/@/libs/fileSystem/PWAFileSystem'
import { Windows } from '/@/components/Windows/Windows'
import { Data } from '/@/libs/data/Data'

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
		})

		await this.projectManager.loadProjects()
		await this.data.load()

		createApp(AppComponent).mount('#app')
	}

	//TODO: Remove listeners on unmount
	public useProjects(): Ref<ProjectData[]> {
		const projects: Ref<ProjectData[]> = ref([])

		const projectManager = this.projectManager

		function updateProjects() {
			projects.value = projectManager.projects
		}

		projectManager.eventSystem.on('updatedProjects', updateProjects)

		return projects
	}

	public useBridgeFolderSelected(): Ref<boolean> {
		const bridgeFolderSelected = ref(false)

		const fileSystem = this.fileSystem

		function updatedFileSystem() {
			bridgeFolderSelected.value = false

			if (fileSystem instanceof PWAFileSystem)
				bridgeFolderSelected.value = fileSystem.setup
		}

		fileSystem.eventSystem.on('reloaded', updatedFileSystem)

		return bridgeFolderSelected
	}
}
