import { EventManager, Signal } from './appCycle/EventSystem'
import { FileType } from './components/Data/FileType'
import { ThemeManager } from './components/Extensions/Themes/ThemeManager'
import { JSONDefaults } from './components/Data/JSONDefaults'
import { FileSystem } from './components/FileSystem/Main'
import { setupFileSystem } from './components/FileSystem/setup'
import { PackIndexer } from './components/PackIndexer/PackIndexer'
import { setupSidebar } from './components/Sidebar/setup'
import { TabSystem } from './components/TabSystem/Main'
import { TaskManager } from './components/TaskManager/TaskManager'
import { setupDefaultMenus } from './components/Toolbar/setupDefaults'
import { getLanguages, selectLanguage } from './utils/locales'
import { Discord as DiscordWindow } from '@/components/Windows/Discord/definition'
import { createNotification } from './components/Notifications/create'

import '@/components/Notifications/Errors'
import '@/appCycle/ResizeWatcher'
import { PackType } from './components/Data/PackType'
import { selectedProject, selectLastProject } from './components/Project/Loader'
import { Windows } from './components/Windows/Windows'
import { SettingsWindow } from './components/Windows/Settings/SettingsWindow'
import Vue from 'vue'
import { settingsState } from './components/Windows/Settings/SettingsState'
import { LoadingWindow } from './components/Windows/LoadingWindow/LoadingWindow'
import { DataLoader } from './components/Data/DataLoader'
import { ProjectConfig } from './components/Project/ProjectConfig'
import { KeyBindingManager } from './components/Actions/KeyBindingManager'
import { ActionManager } from './components/Actions/ActionManager'
import { Toolbar } from './components/Toolbar/Toolbar'
import { Compiler } from './components/Compiler/Compiler'
import { ExtensionLoader } from './components/Extensions/ExtensionLoader'
export class App {
	public static toolbar = new Toolbar()
	public static readonly eventSystem = new EventManager<any>([
		'projectChanged',
		'fileUpdated',
		'currentTabSwitched',
		'refreshCurrentContext',
	])
	public static readonly ready = new Signal<App>()
	protected static _instance: App

	public readonly projectConfig = new ProjectConfig()
	public readonly keyBindingManager = new KeyBindingManager()
	public readonly actionManager = new ActionManager(this)
	public readonly themeManager: ThemeManager
	public readonly taskManager = new TaskManager()
	public readonly packIndexer = new PackIndexer()
	public readonly compiler = new Compiler()
	public readonly tabSystem = Vue.observable(new TabSystem())
	public readonly dataLoader = new DataLoader()
	public readonly fileSystem = new FileSystem()
	public readonly extensionLoader = new ExtensionLoader()

	protected _windows = new Windows()
	get windows() {
		return this._windows
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
				this.tabSystem.hasUnsavedTabs ||
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

	switchProject(projectName: string, forceRefreshCache = false) {
		return new Promise<void>(async resolve => {
			this.packIndexer.start(projectName, forceRefreshCache)

			this.extensionLoader.deactivateAll()
			this.extensionLoader
				.loadExtensions(
					await this.fileSystem.getDirectoryHandle(
						`projects/${projectName}/bridge/plugins`
					)
				)
				.then(() => {
					this.compiler.start(projectName)
				})

			App.eventSystem.dispatch('projectChanged', undefined)
			this.packIndexer.once(() => resolve())
		})
	}

	/**
	 * Starts the app
	 */
	static async main(appComponent: Vue) {
		const lw = new LoadingWindow()
		lw.open()

		this._instance = new App(appComponent)
		await this.instance.beforeStartUp()
		this.instance.fileSystem.setup(await setupFileSystem())
		await this.instance.startUp()
		this.ready.dispatch(this._instance)

		await SettingsWindow.loadSettings()

		lw.close()
		await selectLastProject(this._instance)
	}

	/**
	 * Everything that doesn't need access to the fileSystem should be there immediately
	 */
	async beforeStartUp() {
		console.time('[APP] beforeStartUp()')
		// @ts-expect-error
		if (navigator.clearAppBadge)
			// @ts-expect-error
			navigator.clearAppBadge()

		setupSidebar()
		setupDefaultMenus(this)
		this.dataLoader.setup(this)
		JSONDefaults.setup()

		if (process.env.NODE_ENV === 'development') {
			const discordMsg = createNotification({
				icon: 'mdi-discord',
				message: 'sidebar.notifications.discord.message',
				color: '#7289DA',
				textColor: 'white',
				onClick: () => {
					DiscordWindow.open()
					discordMsg.dispose()
				},
			})

			const gettingStarted = createNotification({
				icon: 'mdi-help-circle-outline',
				message: 'sidebar.notifications.gettingStarted.message',
				onClick: () => {
					App.createNativeWindow(
						'https://bridge-core.github.io/editor-docs/getting-started/'
					)
					gettingStarted.dispose()
				},
			})
		}

		console.timeEnd('[APP] beforeStartUp()')
	}

	/**
	 * Setup systems that need to access the fileSystem
	 */
	async startUp() {
		console.time('[APP] startUp()')

		await Promise.all([
			// Create default folders
			this.fileSystem.mkdir('projects'),
			this.fileSystem.mkdir('plugins'),
			this.fileSystem.mkdir('data'),
			// Setup data helpers
			this.dataLoader.fired.then(() => FileType.setup(this.fileSystem)),
			PackType.setup(this.fileSystem),
		])

		// Load global extensions
		this.extensionLoader.loadExtensions(
			await this.fileSystem.getDirectoryHandle(`plugins`),
			true
		)

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
		console.timeEnd('[APP] startUp()')
	}
}
