import AppComponent from './App.vue'
import { ProjectManager } from '/@/libs/projects/ProjectManager'
import { ThemeManager } from '/@/components/Extensions/Themes/ThemeManager'
import { getFileSystem } from './libs/fileSystem/FileSystem'
import { Ref, createApp, ref } from 'vue'
import { ProjectData } from './libs/projects/Project'
import { PWAFileSystem } from './libs/fileSystem/PWAFileSystem'

export class App {
	public static instance: App

	public fileSystem = getFileSystem()
	public projectManager = new ProjectManager()

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

		createApp(AppComponent).mount('#app')
	}
}

//TODO: Remove listeners on unmount
export function useProjects(): Ref<ProjectData[]> {
	const projects: Ref<ProjectData[]> = ref([])

	function updateProjects() {
		projects.value = App.instance.projectManager.projects
	}

	App.instance.projectManager.eventSystem.on(
		'updatedProjects',
		updateProjects
	)

	return projects
}

export function useBridgeFolderSelected(): Ref<boolean> {
	const bridgeFolderSelected = ref(false)

	function updatedFileSystem() {
		bridgeFolderSelected.value = false

		const fileSystem = App.instance.fileSystem

		if (fileSystem instanceof PWAFileSystem)
			bridgeFolderSelected.value = fileSystem.setup
	}

	App.instance.fileSystem.eventSystem.on('reloaded', updatedFileSystem)

	return bridgeFolderSelected
}
