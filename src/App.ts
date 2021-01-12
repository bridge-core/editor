import { EventManager, Signal } from './appCycle/EventSystem'
import { FileType } from './appCycle/FileType'
import { setupKeyBindings } from './appCycle/keyBindings'
import { ThemeManager } from './components/Plugins/Themes/ThemeManager'
import { setupMonacoEditor } from './components/Editors/Text/setup'
import { FileSystem } from './components/FileSystem/Main'
import { setupFileSystem } from './components/FileSystem/setup'
import { PackIndexer } from './components/LightningCache/PackIndexer'
import { setupSidebar } from './components/Sidebar/setup'
import { mainTabSystem } from './components/TabSystem/Main'
import { TaskManager } from './components/TaskManager/TaskManager'
import { setupDefaultMenus } from './components/Toolbar/setupDefaults'
import { getLanguages, selectLanguage } from './utils/locales'
import { Discord as DiscordWindow } from '@/components/Windows/Discord/definition'
import { createNotification } from './components/Footer/create'

import '@/appCycle/Errors'
import '@/appCycle/ResizeWatcher'
import { PackType } from './appCycle/PackType'
import { selectLastProject } from './components/Project/Loader'

export class App {
	public static readonly ready = new Signal<App>()
	protected static _instance: App

	protected themeManager: ThemeManager
	protected eventSystem = new EventManager<any>()
	public fileSystem!: FileSystem
	public readonly taskManager = new TaskManager()
	public readonly packIndexer = new PackIndexer()

	static async main(appComponent: Vue) {
		this._instance = new App(appComponent)
		await this._instance.startUp()
		this.ready.dispatch(this._instance)
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
			if (
				mainTabSystem.hasUnsavedTabs ||
				this.taskManager.hasRunningTasks
			) {
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
		setupKeyBindings()
		setupDefaultMenus()
		setupSidebar()
		await FileType.setup()
		await PackType.setup()
		setupMonacoEditor()

		// Set language based off of browser language
		// if (!navigator.language.includes('en')) {
		// 	for (const [lang] of getLanguages()) {
		// 		if (navigator.language.includes(lang)) {
		// 			selectLanguage(lang)
		// 		}
		// 	}
		// } else {
		// 	selectLanguage('en')
		// }

		// FileSystem setup
		this.fileSystem = await setupFileSystem()
		// Create default folders
		await Promise.all([
			this.fileSystem.mkdir('projects'),
			this.fileSystem.mkdir('plugins'),
			this.fileSystem.mkdir('data'),
		])

		selectLastProject(this)

		if (process.env.NODE_ENV !== 'development') {
			const discordMsg = createNotification({
				icon: 'mdi-discord',
				message: 'Discord Server',
				color: '#7289DA',
				textColor: 'white',
				onClick: () => {
					DiscordWindow.open()
					discordMsg.dispose()
				},
			})
		}

		if (process.env.NODE_ENV !== 'development') {
			const gettingStarted = createNotification({
				icon: 'mdi-help-circle-outline',
				message: 'Getting Started',
				textColor: 'white',
				onClick: () => {
					window.open(
						'https://bridge-core.github.io/editor-docs/getting-started/'
					)
					gettingStarted.dispose()
				},
			})
		}
	}

	switchProject(projectName: string) {
		return new Promise<void>(resolve => {
			this.packIndexer.start(projectName)
			this.packIndexer.once(() => resolve())
		})
	}
}
