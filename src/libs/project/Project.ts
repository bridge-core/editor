import { Extensions } from '@/libs/extensions/Extensions'
import { Sidebar } from '@/components/Sidebar/Sidebar'
import { join } from '@/libs/path'
import { ConfirmWindow } from '@/components/Windows/Confirm/ConfirmWindow'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { get, set } from 'idb-keyval'
import { IConfigJson } from 'mc-project-core'
import { LocalFileSystem } from '@/libs/fileSystem/LocalFileSystem'
import { Settings } from '@/libs/settings/Settings'
import { SettingsWindow } from '@/components/Windows/Settings/SettingsWindow'
import { Windows } from '@/components/Windows/Windows'
import { AsyncDisposable, Disposable, disposeAll } from '@/libs/disposeable/Disposeable'
import { Event } from '@/libs/event/Event'

export class Project implements AsyncDisposable {
	public path: string
	public icon: string | null = null
	public config: IConfigJson | null = null

	public outputFileSystem: BaseFileSystem = new LocalFileSystem()
	public usingProjectOutputFolder: boolean = false

	public packs: { [key: string]: string } = {}

	public usingProjectOutputFolderChanged: Event<undefined> = new Event()

	private projectOutputFolderHandleKey: string = ''
	private usingProjectOutputFolderKey: string = ''

	private disposables: Disposable[] = []

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

		this.disposables.push(Settings.updated.on(this.settingsChanged.bind(this)))

		this.usingProjectOutputFolder = (await get(this.usingProjectOutputFolderKey)) ?? false
		this.usingProjectOutputFolderChanged.dispatch(undefined)

		await this.setupOutputFileSystem()

		await Extensions.loadProjectExtensions()
	}

	public async dispose() {
		disposeAll(this.disposables)

		Extensions.disposeProjectExtensions()
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

		this.usingProjectOutputFolderChanged.dispatch(undefined)
	}

	public async clearLocalProjectFolder() {
		if (!this.usingProjectOutputFolder) return

		this.usingProjectOutputFolder = false

		this.usingProjectOutputFolderChanged.dispatch(undefined)

		await set(this.projectOutputFolderHandleKey, undefined)

		await this.setupOutputFileSystem()
	}

	protected async setOutputFileSystem(fileSystem: BaseFileSystem) {
		this.outputFileSystem = fileSystem
	}

	protected async settingsChanged(event: unknown) {
		if ((event as { id: string; value: unknown }).id !== 'outputFolder') return

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
			: Settings.get('outputFolder')

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

		this.usingProjectOutputFolderChanged.dispatch(undefined)

		Sidebar.addNotification(
			'warning',
			() => {
				Windows.open(
					new ConfirmWindow('You have not set up your output folder yet. Do you want to set it up now?', () =>
						SettingsWindow.open('projects')
					)
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
