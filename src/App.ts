import { EventManager, Signal } from './appCycle/EventSystem'
import { FileType } from './components/Data/FileType'
import { setupKeyBindings } from './appCycle/keyBindings'
import { ThemeManager } from './components/Plugins/Themes/ThemeManager'
import { setupMonacoEditor } from './components/Editors/Text/setup'
import { FileSystem } from './components/FileSystem/Main'
import { setupFileSystem } from './components/FileSystem/setup'
import { PackIndexer } from './components/PackIndexer/PackIndexer'
import { setupSidebar } from './components/Sidebar/setup'
import { mainTabSystem } from './components/TabSystem/Main'
import { TaskManager } from './components/TaskManager/TaskManager'
import { setupDefaultMenus } from './components/Toolbar/setupDefaults'
import { getLanguages, selectLanguage } from './utils/locales'
import { Discord as DiscordWindow } from '@/components/Windows/Discord/definition'
import { createNotification } from './components/Notifications/create'

import '@/components/Notifications/Errors'
import '@/appCycle/ResizeWatcher'
import { PackType } from './components/Data/PackType'
import { selectLastProject } from './components/Project/Loader'
import { Windows } from './components/Windows/Windows'
import { SettingsWindow } from './components/Windows/Settings/SettingsWindow'
import Vue from 'vue'
import { settingsState } from './components/Windows/Settings/SettingsState'
import { LoadingWindow } from './components/Windows/LoadingWindow/LoadingWindow'
import { DataLoader } from './components/Data/DataLoader'
export class App {
	public static readonly eventSystem = new EventManager<any>([
		'projectChanged',
	])
	public static readonly ready = new Signal<App>()
	protected static _instance: App

	public fileSystem!: FileSystem
	public readonly themeManager: ThemeManager
	public readonly taskManager = new TaskManager()
	public readonly packIndexer = new PackIndexer()
	protected _windows!: Windows
	get windows() {
		return this._windows
	}

	static async main(appComponent: Vue) {
		const lw = new LoadingWindow()
		lw.open()

		this._instance = new App(appComponent)
		await this._instance.startUp()
		this.ready.dispatch(this._instance)
		await SettingsWindow.loadSettings()
		this._instance._windows = new Windows()

		lw.close()

		await selectLastProject(this._instance)
	}
	static get instance() {
		return this._instance
	}
	static getApp() {
		return new Promise<App>(resolve => App.ready.once(app => resolve(app)))
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
		if (settingsState?.general?.openLinksInBrowser)
			return window.open(url, '_blank')
		return window.open(url, id, 'toolbar=no,menubar=no,status=no')
	}

	async startUp() {
		// @ts-expect-error
		if (navigator.clearAppBadge)
			// @ts-expect-error
			navigator.clearAppBadge()

		setupSidebar()
		setupKeyBindings()
		setupDefaultMenus()

		// FileSystem setup
		this.fileSystem = await setupFileSystem()
		// Create default folders
		await Promise.all([
			this.fileSystem.mkdir('projects'),
			this.fileSystem.mkdir('plugins'),
			this.fileSystem.mkdir('data'),
		])
		await DataLoader.setup(this.fileSystem)

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
		await FileType.setup(this.fileSystem)
		await PackType.setup(this.fileSystem)
		setupMonacoEditor()

		if (process.env.NODE_ENV === 'development') {
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

		if (process.env.NODE_ENV === 'development') {
			const gettingStarted = createNotification({
				icon: 'mdi-help-circle-outline',
				message: 'Getting Started',
				textColor: 'white',
				onClick: () => {
					App.createNativeWindow(
						'https://bridge-core.github.io/editor-docs/getting-started/'
					)
					gettingStarted.dispose()
				},
			})
		}
	}

	switchProject(projectName: string, forceRefreshCache = false) {
		return new Promise<void>(resolve => {
			this.packIndexer.start(projectName, forceRefreshCache)
			App.eventSystem.dispatch('projectChanged', undefined)
			this.packIndexer.once(() => resolve())
		})
	}
}
