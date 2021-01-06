import { EventDispatcher, EventManager, Signal } from './appCycle/EventSystem'
import { ThemeManager } from './appCycle/ThemeManager'
import { FileSystem } from './components/FileSystem/Main'
import { setupFileSystem } from './components/FileSystem/setup'
import { PackIndexer } from './components/PackIndexer/PackIndexer'
import { mainTabSystem } from './components/TabSystem/Main'
import { TaskManager } from './components/TaskManager/TaskManager'

export class App {
	public static readonly ready = new Signal<App>()
	protected static _instance: App

	protected themeManager: ThemeManager
	protected eventSystem = new EventManager<any>()
	public fileSystem!: FileSystem
	public readonly taskManager = new TaskManager()
	protected packIndexer = new PackIndexer()

	static async main(appComponent: Vue) {
		this._instance = new App(appComponent)
		await this._instance.startUp()
		this.ready.dispatch(this._instance)
		this._instance.packIndexer.start()
	}
	static get instance() {
		return this._instance
	}
	constructor(appComponent: Vue) {
		// @ts-expect-error Typescript doesn't know about vuetify
		this.themeManager = new ThemeManager(appComponent.$vuetify)

		// Prompt the user whether they really want to close bridge. when unsaved tabs are open
		const saveWarning =
			'Are you sure that you want to close bridge.? Unsaved progress will be lost.'
		window.addEventListener('beforeunload', event => {
			if (mainTabSystem.hasUnsavedTabs) {
				event.preventDefault()
				event.returnValue = saveWarning
				return saveWarning
			}
		})
	}

	static createNativeWindow(url: string, id?: string) {
		window.open(url, id, 'toolbar=no,menubar=no,status=no')
	}

	async startUp() {
		this.fileSystem = await setupFileSystem()
	}
}
