import { join } from '@/libs/path'
import { confirmWindow, fileSystem, settings, sidebar } from '@/App'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { get, set } from 'idb-keyval'
import { EventSystem } from '@/libs/event/EventSystem'
import { LocalFileSystem } from '../fileSystem/LocalFileSystem'
import { IConfigJson } from 'mc-project-core'

export class Project {
	public path: string
	public icon: string | null = null
	public config: IConfigJson | null = null
	public outputFileSystem: BaseFileSystem = new LocalFileSystem()
	public eventSystem = new EventSystem(['outputFileSystemChanged'])
	public packs: { [key: string]: string } = {}

	constructor(public name: string) {
		this.path = join('projects', this.name)

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

		settings.eventSystem.on('settingsChanged', this.settingsChanged.bind(this))

		if (fileSystem instanceof PWAFileSystem) await this.loadPWAFileSystem()
	}

	public async dispose() {
		settings.eventSystem.off('settingsChanged', this.settingsChanged.bind(this))
	}

	protected async settingsChanged() {
		if (!(fileSystem instanceof PWAFileSystem)) return

		if (await this.getLocalProjectFolder()) return

		const outputFolderHandle = settings.get('outputFolder')

		if (!outputFolderHandle) return

		if (outputFolderHandle === this.outputFileSystem) return

		const newOutputFileSystem = new PWAFileSystem()

		if (!(await newOutputFileSystem.ensurePermissions(outputFolderHandle))) return

		newOutputFileSystem.setBaseHandle(outputFolderHandle)

		this.setOutputFileSystem(newOutputFileSystem)
	}

	private async loadPWAFileSystem() {
		let savedHandle: FileSystemDirectoryHandle | undefined = await this.getLocalProjectFolder()

		if (!savedHandle) savedHandle = settings.get('outputFolder')

		const newOutputFileSystem = new PWAFileSystem()

		if (savedHandle && (await newOutputFileSystem.ensurePermissions(savedHandle))) {
			newOutputFileSystem.setBaseHandle(savedHandle)

			await this.setOutputFileSystem(newOutputFileSystem)
		} else {
			sidebar.addNotification(
				'warning',
				() => {
					confirmWindow.open(
						'You have not set up your output folder yet. Do you want to set it up now?',
						() => settings.open('projects')
					)
				},
				'warning'
			)
		}
	}

	protected async setOutputFileSystem(fileSystem: BaseFileSystem) {
		this.outputFileSystem = fileSystem

		this.eventSystem.dispatch('outputFileSystemChanged', undefined)
	}

	public async setOutputFolder(handle: FileSystemDirectoryHandle) {
		const newOutputFileSystem = new PWAFileSystem()
		newOutputFileSystem.setBaseHandle(handle)

		if (!(await newOutputFileSystem.ensurePermissions(handle))) return

		await this.setOutputFileSystem(newOutputFileSystem)
	}

	public async setLocalProjectFolder(handle: FileSystemDirectoryHandle) {
		await set(`projectOutputFolderHandle-${this.name}`, handle)

		await this.setOutputFolder(handle)
	}

	public async getLocalProjectFolder(): Promise<FileSystemDirectoryHandle | undefined> {
		return await get(`projectOutputFolderHandle-${this.name}`)
	}

	public async clearLocalProjectFolder() {
		await set(`projectOutputFolderHandle-${this.name}`, undefined)

		if (fileSystem instanceof PWAFileSystem) await this.loadPWAFileSystem()
	}

	public resolvePackPath(packId?: string, path?: string) {
		if (!this.config) return ''
		if (!this.config.packs) return ''

		if (packId === undefined && path === undefined) return this.path

		if (packId === undefined) return join(this.path ?? '', path!)

		if (path === undefined) return join(this.path ?? '', (<any>this.config.packs)[packId])

		return join(this.path ?? '', (<any>this.config.packs)[packId], path)
	}
}

export async function validProject(path: string) {
	return await fileSystem.exists(join(path, 'config.json'))
}
