import { join } from '@/libs/path'
import { confirmWindow, fileSystem, settings, sidebar } from '@/App'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { get, set } from 'idb-keyval'
import { EventSystem } from '@/libs/event/EventSystem'
import { IConfigJson } from 'mc-project-core'
import { Ref, onMounted, onUnmounted, ref, watch } from 'vue'
import { LocalFileSystem } from '@/libs/fileSystem/LocalFileSystem'
import { ProjectManager } from './ProjectManager'

export class Project {
	public path: string
	public icon: string | null = null
	public config: IConfigJson | null = null

	public outputFileSystem: BaseFileSystem = new LocalFileSystem()
	public usingProjectOutputFolder: boolean = false

	public packs: { [key: string]: string } = {}

	public eventSystem = new EventSystem(['usingProjectOutputFolderChanged'])

	private projectOutputFolderHandleKey: string = ''
	private usingProjectOutputFolderKey: string = ''

	constructor(public name: string) {
		this.path = join('projects', this.name)

		this.projectOutputFolderHandleKey = `projectOutputFolderHandle-${this.name}`
		this.usingProjectOutputFolderKey = `usingProjectFolder-${this.name}`

		if (!(this.outputFileSystem instanceof LocalFileSystem)) return

		this.outputFileSystem.setRootName(this.name)
	}

	public async load() {
		this.config = await fileSystem.readFileJson(join(this.path, 'config.json'))

		if (!this.config) throw new Error('Failed to load project config!')

		for (const [packId, packPath] of Object.entries(this.config.packs)) {
			this.packs[packId] = join(this.path, packPath)
		}

		this.icon = await fileSystem.readFileDataUrl(join(this.path, 'BP', 'pack_icon.png'))

		settings.eventSystem.on('updated', this.settingsChanged.bind(this))

		this.usingProjectOutputFolder = (await get(this.usingProjectOutputFolderKey)) ?? false
		this.eventSystem.dispatch('usingProjectOutputFolderChanged', undefined)

		await this.setupOutputFileSystem()
	}

	public async dispose() {
		settings.eventSystem.off('updated', this.settingsChanged.bind(this))
	}

	public resolvePackPath(packId?: string, path?: string) {
		if (!this.config) return ''
		if (!this.config.packs) return ''

		if (packId === undefined && path === undefined) return this.path

		if (packId === undefined) return join(this.path ?? '', path!)

		if (path === undefined) return join(this.path ?? '', (<any>this.config.packs)[packId])

		return join(this.path ?? '', (<any>this.config.packs)[packId], path)
	}

	public async getLocalProjectFolderHandle(): Promise<FileSystemDirectoryHandle | undefined> {
		return await get(this.projectOutputFolderHandleKey)
	}

	public async setLocalProjectFolderHandle(handle: FileSystemDirectoryHandle) {
		await set(this.projectOutputFolderHandleKey, handle)

		this.usingProjectOutputFolder = await this.setOutputFolderHandle(handle)
		await set(this.usingProjectOutputFolderKey, this.usingProjectOutputFolder)
		this.eventSystem.dispatch('usingProjectOutputFolderChanged', undefined)
	}

	public async clearLocalProjectFolder() {
		if (!this.usingProjectOutputFolder) return

		this.usingProjectOutputFolder = false
		this.eventSystem.dispatch('usingProjectOutputFolderChanged', undefined)

		await set(this.projectOutputFolderHandleKey, undefined)

		await this.setupOutputFileSystem()
	}

	protected async setOutputFileSystem(fileSystem: BaseFileSystem) {
		this.outputFileSystem = fileSystem
	}

	protected async settingsChanged(event: unknown) {
		if ((event as { id: string; value: unknown }).value !== 'outputFolder') return

		if (!(fileSystem instanceof PWAFileSystem)) return

		if (this.usingProjectOutputFolder) return

		await this.setupOutputFileSystem()
	}

	private async setOutputFolderHandle(handle: FileSystemDirectoryHandle): Promise<boolean> {
		const newOutputFileSystem = new PWAFileSystem()
		newOutputFileSystem.setBaseHandle(handle)

		if (!(await newOutputFileSystem.ensurePermissions(handle))) return false

		await this.setOutputFileSystem(newOutputFileSystem)

		return true
	}

	private async setupOutputFileSystem() {
		if (fileSystem instanceof PWAFileSystem) await this.setupOutputFileSystemPWA()
	}

	private async setupOutputFileSystemPWA() {
		const localProjectFolder = await this.getLocalProjectFolderHandle()

		let newOutputFolderHandle: FileSystemDirectoryHandle | undefined = this.usingProjectOutputFolder
			? localProjectFolder
			: settings.get('outputFolder')

		let newOutputFileSystem = new PWAFileSystem()

		if (newOutputFolderHandle && (await newOutputFileSystem.ensurePermissions(newOutputFolderHandle))) {
			if (
				this.outputFileSystem instanceof PWAFileSystem &&
				newOutputFolderHandle === this.outputFileSystem.baseHandle
			)
				return

			newOutputFileSystem.setBaseHandle(newOutputFolderHandle)

			await this.setOutputFileSystem(newOutputFileSystem)

			return
		}

		this.usingProjectOutputFolder = false
		await set(this.usingProjectOutputFolderKey, false)
		this.eventSystem.dispatch('usingProjectOutputFolderChanged', undefined)

		sidebar.addNotification(
			'warning',
			() => {
				confirmWindow.open('You have not set up your output folder yet. Do you want to set it up now?', () =>
					settings.open('projects')
				)
			},
			'warning'
		)

		const localFileSystem = new LocalFileSystem()
		localFileSystem.setRootName(this.name)

		this.setOutputFileSystem(localFileSystem)
	}
}

export async function validProject(path: string) {
	if (!(await fileSystem.exists(join(path, 'BP/pack_icon.png')))) return false

	return await fileSystem.exists(join(path, 'config.json'))
}

export function useUsingProjectOutputFolder(): Ref<boolean> {
	const usingProjectOutputFolder: Ref<boolean> = ref(false)

	function update() {
		if (!ProjectManager.currentProject) {
			usingProjectOutputFolder.value = false

			return
		}

		usingProjectOutputFolder.value = ProjectManager.currentProject.usingProjectOutputFolder
	}

	watch(ProjectManager.useCurrentProject(), (newProject, oldProject) => {
		if (oldProject) oldProject.eventSystem.off('usingProjectOutputFolderChanged', update)

		if (newProject) {
			newProject.eventSystem.on('usingProjectOutputFolderChanged', update)

			update()
		}
	})

	onMounted(() => {
		if (ProjectManager.currentProject)
			ProjectManager.currentProject.eventSystem.on('usingProjectOutputFolderChanged', update)

		update()
	})
	onUnmounted(() => {
		if (ProjectManager.currentProject)
			ProjectManager.currentProject.eventSystem.off('usingProjectOutputFolderChanged', update)
	})

	return usingProjectOutputFolder
}
