import '/@/components/Notifications/Errors'
import '/@/components/Languages/LanguageManager'
import '/@/components/App/ServiceWorker'

import Vue from 'vue'
import { EventSystem } from '/@/components/Common/Event/EventSystem'
import { Signal } from '/@/components/Common/Event/Signal'
import { FileType } from '/@/components/Data/FileType'
import { ThemeManager } from '/@/components/Extensions/Themes/ThemeManager'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { FileSystemSetup } from '/@/components/FileSystem/Setup'
import { setupSidebar } from '/@/components/Sidebar/setup'
import { TaskManager } from '/@/components/TaskManager/TaskManager'
import { setupDefaultMenus } from '/@/components/Toolbar/setupDefaults'
import { Locales } from '/@/utils/locales'
import { createNotification } from '/@/components/Notifications/create'
import { PackType } from '/@/components/Data/PackType'
import { Windows } from '/@/components/Windows/Windows'
import { SettingsWindow } from '/@/components/Windows/Settings/SettingsWindow'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { DataLoader } from './components/Data/DataLoader'
import { KeyBindingManager } from '/@/components/Actions/KeyBindingManager'
import { ActionManager } from '/@/components/Actions/ActionManager'
import { Toolbar } from '/@/components/Toolbar/Toolbar'
import { WindowResize } from '/@/components/Common/WindowResize'
import { InstallApp } from '/@/components/App/Install'
import { LanguageManager } from '/@/components/Languages/LanguageManager'
import { ProjectManager } from '/@/components/Projects/ProjectManager'
import { ContextMenu } from '/@/components/ContextMenu/ContextMenu'
import { Project } from '/@/components/Projects/Project/Project'
import { get, set } from 'idb-keyval'
import { GlobalExtensionLoader } from '/@/components/Extensions/GlobalExtensionLoader'
import { FileDropper } from '/@/components/FileDropper/FileDropper'
import { FileImportManager } from '/@/components/ImportFile/Manager'
import { ComMojang } from './components/FileSystem/ComMojang'
import { AudioManager } from '/@/components/Audio/AudioManager'

export class App {
	public static fileSystemSetup = new FileSystemSetup()
	public static toolbar = new Toolbar()
	public static readonly eventSystem = new EventSystem<any>([
		'projectChanged',
		'currentTabSwitched',
		'refreshCurrentContext',
		'disableValidation',
		'fileAdded',
	])
	public static readonly ready = new Signal<App>()
	protected static _instance: Readonly<App>
	public static readonly audioManager = new AudioManager()

	public readonly keyBindingManager = new KeyBindingManager()
	public readonly actionManager = new ActionManager(this.keyBindingManager)
	public readonly themeManager: ThemeManager
	public readonly taskManager = new TaskManager()
	public readonly dataLoader = new DataLoader(this)
	public readonly fileSystem = new FileSystem()
	public readonly projectManager = Vue.observable(new ProjectManager(this))
	public readonly extensionLoader = new GlobalExtensionLoader(this)
	public readonly windowResize = new WindowResize()
	public readonly contextMenu = new ContextMenu()
	public readonly locales: Locales
	public readonly fileDropper = new FileDropper(this)
	public readonly fileImportManager = new FileImportManager(this.fileDropper)
	public readonly comMojang = new ComMojang(this)

	protected languageManager = new LanguageManager()
	protected installApp = new InstallApp()
	protected _windows: Windows
	get windows() {
		return this._windows
	}

	get tabSystem() {
		return this.projectManager.currentProject?.tabSystem
	}
	get selectedProject() {
		return this.projectManager.selectedProject
	}
	get project() {
		if (!this.projectManager.currentProject)
			throw new Error(
				`Trying to access project before it is defined. Make sure to await app.projectManager.projectReady.fired`
			)
		return this.projectManager.currentProject
	}
	get projects() {
		return Object.values(this.projectManager.state)
	}
	get projectConfig() {
		return this.project.config
	}

	static get instance() {
		return <App>this._instance
	}
	static getApp() {
		return new Promise<App>((resolve) =>
			App.ready.once((app) => resolve(app))
		)
	}

	constructor(appComponent: Vue) {
		this.themeManager = new ThemeManager(appComponent.$vuetify)
		this.locales = new Locales(appComponent.$vuetify)
		this._windows = new Windows(this)

		// Prompt the user whether they really want to close bridge. when unsaved tabs are open
		const saveWarning =
			'Are you sure that you want to close bridge.? Unsaved progress will be lost.'
		// Only prompt in prod mode so we can use HMR in dev mode
		if (process.env.NODE_ENV === 'production') {
			window.addEventListener('beforeunload', (event) => {
				if (
					this.tabSystem?.hasUnsavedTabs ||
					this.taskManager.hasRunningTasks
				) {
					event.preventDefault()
					event.returnValue = saveWarning
					return saveWarning
				}
			})
		}
	}

	static createNativeWindow(url: string, id?: string) {
		if (settingsState?.general?.openLinksInBrowser)
			return window.open(url, '_blank')
		return window.open(url, id, 'toolbar=no,menubar=no,status=no')
	}

	async switchProject(project: Project) {
		this.themeManager.updateTheme()

		// Set language
		if (typeof settingsState?.general?.locale === 'string')
			this.locales.selectLanguage(settingsState?.general?.locale)
		else {
			// Set language based off of browser language
			for (const [lang] of this.locales.getLanguages()) {
				if (navigator.language.includes(lang)) {
					this.locales.selectLanguage(lang)
				}
			}
		}

		App.eventSystem.dispatch('projectChanged', undefined)
	}

	/**
	 * Starts the app
	 */
	static async main(appComponent: Vue) {
		this._instance = Object.freeze(new App(appComponent))
		this.instance.windows.loadingWindow.open()

		await this.instance.beforeStartUp()

		// Try setting up the file system
		const fileHandle = await this.fileSystemSetup.setupFileSystem(
			this.instance
		)
		if (!fileHandle) return this.instance.windows.loadingWindow.close()

		this.instance.fileSystem.setup(fileHandle)

		// Show changelog after an update
		if (await get<boolean>('firstStartAfterUpdate')) {
			await set('firstStartAfterUpdate', false)
			this.instance.windows.changelogWindow.open()
		}

		// Load settings
		await SettingsWindow.loadSettings(this.instance).then(async () => {
			await this.instance.dataLoader.fired
			this.instance.themeManager.loadDefaultThemes(this.instance)
		})

		await this.instance.startUp()

		this.ready.dispatch(this.instance)
		await this.instance.projectManager.selectLastProject(this.instance)

		this.instance.windows.loadingWindow.close()
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
		this.dataLoader.start()

		if (process.env.NODE_ENV === 'production') {
			const socialsMsg = createNotification({
				icon: 'mdi-link-variant',
				message: 'sidebar.notifications.socials.message',
				color: '#1DA1F2',
				textColor: 'white',
				onClick: () => {
					this.windows.socialsWindow.open()
					socialsMsg.dispose()
				},
			})
			/* Removed until getting started updated to v2
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
			*/
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
			this.fileSystem.mkdir('extensions'),
			this.fileSystem.mkdir('data/packages'),
			// Setup data helpers
			this.dataLoader.fired.then(() => FileType.setup(this.fileSystem)),
			this.dataLoader.fired.then(() => PackType.setup(this.fileSystem)),
		])

		// Ensure that a project is selected
		this.projectManager.projectReady.fired.then(async () =>
			// Then load global extensions
			this.extensionLoader.loadExtensions(
				await this.fileSystem.getDirectoryHandle(`extensions`)
			)
		)

		console.timeEnd('[APP] startUp()')
	}
}
