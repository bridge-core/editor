import { Extensions } from '@/libs/extensions/Extensions'
import { basename, join } from 'pathe'
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
import { NotificationSystem } from '@/components/Notifications/NotificationSystem'
import { tauriBuild } from '@/libs/tauri/Tauri'
import { TauriFileSystem } from '@/libs/fileSystem/TauriFileSystem'

export class Project implements AsyncDisposable {
	public path: string
	public icon: string | null = null
	public config: IConfigJson | null = null
	public globals: any = null

	public outputFileSystem: BaseFileSystem = new LocalFileSystem()
	public usingProjectOutputFolder: boolean = false

	public packs: { [key: string]: string } = {}

	public usingProjectOutputFolderChanged: Event<undefined> = new Event()

	private projectOutputFolderDataKey: string = ''
	private usingProjectOutputFolderKey: string = ''

	private disposables: Disposable[] = []

	constructor(public name: string) {
		this.path = join('/projects', this.name)

		this.projectOutputFolderDataKey = `projectOutputFolderHandle-${this.name}`
		this.usingProjectOutputFolderKey = `usingProjectFolder-${this.name}`

		fileSystem.watch(this.path)
		fileSystem.ingorePath(join(this.path, '.git'))

		if (this.outputFileSystem instanceof LocalFileSystem) this.outputFileSystem.setRootName(this.name)
	}

	public async load() {
		this.config = await fileSystem.readFileJson(join(this.path, 'config.json'))

		if (!this.config) throw new Error('Failed to load project config!')

		for (const [packId, packPath] of Object.entries(this.config.packs)) {
			this.packs[packId] = join(this.path, packPath)

			if (await fileSystem.exists(join(this.packs[packId], 'pack_icon.png')))
				this.icon = await fileSystem.readFileDataUrl(join(this.packs[packId], 'pack_icon.png'))
		}

		if (await fileSystem.exists(join(this.path, 'globals.json'))) {
			try {
				this.globals = await fileSystem.readFileJson(join(this.path, 'globals.json'))
			} catch {
				throw new Error('Failed to loadp roject globals!')
			}
		}

		this.disposables.push(Settings.updated.on(this.settingsChanged.bind(this)))

		await this.setupOutputFileSystem()

		await Extensions.loadProjectExtensions()
	}

	public async dispose() {
		fileSystem.unwatch(this.path)

		disposeAll(this.disposables)

		await Extensions.unloadProjectExtensions()
	}

	public resolvePackPath(packId?: string, path?: string) {
		if (!this.config) return ''
		if (!this.config.packs) return ''

		if (packId === undefined && path === undefined) return this.path

		if (packId === undefined) return join(this.path ?? '', path!)

		if (path === undefined) return join(this.path ?? '', (<any>this.config.packs)[packId])

		return join(this.path ?? '', (<any>this.config.packs)[packId], path)
	}

	public async saveTabManagerState(state: any) {
		await set(`tabManagerState-${this.name}`, JSON.stringify(state))
	}

	public async getTabManagerState() {
		const stateString = await get(`tabManagerState-${this.name}`)

		if (!stateString) return null

		try {
			return JSON.parse(stateString) ?? null
		} catch {}

		return null
	}

	protected async setupOutputFileSystem() {
		if (!tauriBuild) return

		this.usingProjectOutputFolder = (await get(this.usingProjectOutputFolderKey)) ?? false
		this.usingProjectOutputFolderChanged.dispatch()

		let outputFolderData = Settings.get('outputFolder')

		if (this.usingProjectOutputFolder) outputFolderData = (await get(this.projectOutputFolderDataKey)) ?? outputFolderData

		if (!outputFolderData) return
		if ((outputFolderData as { type: string }).type !== 'tauri') return

		const fileSystem = new TauriFileSystem()
		fileSystem.setBasePath((outputFolderData as { type: string; path: string }).path)

		await this.setOutputFileSystem(fileSystem)
	}

	protected async setOutputFileSystem(fileSystem: BaseFileSystem) {
		this.outputFileSystem = fileSystem
	}

	public async setLocalOutputFolderData(data: unknown) {
		await set(this.projectOutputFolderDataKey, data)

		await set(this.usingProjectOutputFolderKey, true)

		await this.setupOutputFileSystem()
	}

	public async clearLocalProjectFolder() {
		if (!this.usingProjectOutputFolder) return

		await set(this.usingProjectOutputFolderKey, false)

		await this.setupOutputFileSystem()
	}

	protected async settingsChanged(event: unknown) {
		if ((event as { id: string; value: unknown }).id !== 'outputFolder') return

		await this.setupOutputFileSystem()
	}
}
