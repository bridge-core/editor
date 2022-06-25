import '/@/components/Notifications/Errors'
import '/@/components/Languages/LanguageManager'
import '/@/components/App/ServiceWorker'

import Vue from 'vue'
import { EventSystem } from '/@/components/Common/Event/EventSystem'
import { Signal } from '/@/components/Common/Event/Signal'
import { FileTypeLibrary } from '/@/components/Data/FileType'
import { ThemeManager } from '/@/components/Extensions/Themes/ThemeManager'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { FileSystemSetup } from '/@/components/FileSystem/Setup'
import { setupSidebar } from '/@/components/Sidebar/setup'
import { TaskManager } from '/@/components/TaskManager/TaskManager'
import { setupDefaultMenus } from '/@/components/Toolbar/setupDefaults'
import { Locales } from '/@/utils/locales'
import { PackTypeLibrary } from '/@/components/Data/PackType'
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
import { get, set } from 'idb-keyval'
import { GlobalExtensionLoader } from '/@/components/Extensions/GlobalExtensionLoader'
import { FileDropper } from '/@/components/FileDropper/FileDropper'
import { FileImportManager } from '/@/components/ImportFile/Manager'
import { ComMojang } from './components/FileSystem/ComMojang'
import { isUsingFileSystemPolyfill } from './components/FileSystem/Polyfill'
import { markRaw } from '@vue/composition-api'
import { ConfiguredJsonLanguage } from '/@/components/Languages/Json/Main'
import { WindowState } from '/@/components/Windows/WindowState'
import { Mobile } from '/@/components/App/Mobile'
import { PackExplorer } from '/@/components/PackExplorer/PackExplorer'
import { PersistentNotification } from '/@/components/Notifications/PersistentNotification'
import { version as appVersion } from '/@/utils/app/version'
import { platform } from '/@/utils/os'
import { virtualProjectName } from './components/Projects/Project/Project'
import { AnyDirectoryHandle } from './components/FileSystem/Types'
import { getStorageDirectory } from './utils/getStorageDirectory'
import { FolderImportManager } from './components/ImportFolder/manager'

export class App {
	public static readonly windowState = new WindowState()
	public static readonly installApp = new InstallApp()
	public static fileSystemSetup = new FileSystemSetup()
	public static toolbar = new Toolbar()
	public static readonly eventSystem = new EventSystem<any>([
		'projectChanged',
		'currentTabSwitched',
		'refreshCurrentContext',
		'disableValidation',
		'fileAdded',
		'fileChange',
		'fileSave',
		'fileUnlinked',
		'presetsChanged',
		'availableProjectsFileChanged',
	])
	public static readonly ready = new Signal<App>()
	protected static _instance: Readonly<App>

	public readonly packExplorer = new PackExplorer()
	public readonly keyBindingManager = new KeyBindingManager()
	public readonly actionManager = new ActionManager(this.keyBindingManager)
	public readonly themeManager: ThemeManager
	public readonly taskManager = new TaskManager()
	public readonly dataLoader = markRaw(new DataLoader(true))
	public readonly fileSystem = new FileSystem()
	public readonly projectManager = new ProjectManager(this)
	public readonly extensionLoader = new GlobalExtensionLoader(this)
	public readonly windowResize = new WindowResize()
	public readonly contextMenu = new ContextMenu()
	public readonly locales: Locales
	public readonly fileDropper = new FileDropper(this)
	public readonly fileImportManager = new FileImportManager(this.fileDropper)
	public readonly folderImportManager = new FolderImportManager()
	public readonly comMojang = new ComMojang(this)
	public readonly configuredJsonLanguage = markRaw(
		new ConfiguredJsonLanguage()
	)
	public static readonly fileType = markRaw(new FileTypeLibrary())
	public static readonly packType = markRaw(new PackTypeLibrary())

	public readonly mobile: Mobile

	public readonly languageManager = markRaw(new LanguageManager())

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

	get isNoProjectSelected() {
		return (
			this.projectManager.currentProject === null ||
			this.projectManager.currentProject.isVirtualProject
		)
	}
	get hasNoProjects() {
		return (
			this.isNoProjectSelected && this.projectManager.totalProjects <= 1
		)
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
		try {
			return this.project.config
		} catch {
			throw new Error(
				`Trying to access projectConfig before project is defined. Make sure to await app.projectManager.projectReady.fired`
			)
		}
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
		if (import.meta.env.PROD) this.dataLoader.loadData()
		this.themeManager = new ThemeManager(appComponent.$vuetify)
		this.locales = new Locales(appComponent.$vuetify)
		this._windows = new Windows(this)

		this.mobile = new Mobile(appComponent.$vuetify)

		// Prompt the user whether they really want to close bridge. when unsaved tabs are open
		const saveWarning =
			'Are you sure that you want to close bridge.? Unsaved progress will be lost.'
		// Only prompt in prod mode so we can use HMR in dev mode
		if (import.meta.env.PROD) {
			window.addEventListener('beforeunload', (event) => {
				if (
					this.tabSystem?.hasUnsavedTabs ||
					this.taskManager.hasRunningTasks ||
					isUsingFileSystemPolyfill.value
				) {
					event.preventDefault()
					event.returnValue = saveWarning
					return saveWarning
				}
			})
		}
	}

	static openUrl(url: string, id?: string, openInBrowser = false) {
		if (settingsState?.general?.openLinksInBrowser || openInBrowser)
			return window.open(url, '_blank')
		return window.open(url, id, 'toolbar=no,menubar=no,status=no')
	}

	/**
	 * Starts the app
	 */
	static async main(appComponent: Vue) {
		console.time('[APP] Ready')
		this._instance = markRaw(Object.freeze(new App(appComponent)))
		this.instance.windows.loadingWindow.open()

		await this.instance.beforeStartUp()

		this.instance.fileSystem.setup(await getStorageDirectory())
		await this.instance.fileSystem.unlink(`projects/${virtualProjectName}`)

		// Show changelog after an update
		if (await get<boolean>('firstStartAfterUpdate')) {
			await set('firstStartAfterUpdate', false)
			this.instance.windows.changelogWindow.open()
		}

		// Load settings
		const settingsLoaded = SettingsWindow.loadSettings(this.instance)
		await settingsLoaded

		// Force data download
		if (import.meta.env.DEV)
			this.instance.dataLoader.loadData(
				<boolean>settingsState?.developers?.forceDataDownload ?? false
			)

		settingsLoaded.then(async () => {
			await this.instance.dataLoader.fired
			this.instance.themeManager.loadDefaultThemes(this.instance)
		})

		await this.instance.startUp()

		this.ready.dispatch(this.instance)
		await this.instance.projectManager.selectLastProject()

		this.instance.windows.loadingWindow.close()
		console.timeEnd('[APP] Ready')
	}

	/**
	 * Everything that doesn't need access to the fileSystem should be there immediately
	 */
	async beforeStartUp() {
		console.log(
			`--- Running bridge. ${appVersion} on a "${platform()}" machine ---`
		)
		console.time('[APP] beforeStartUp()')
		// @ts-expect-error
		if (navigator.clearAppBadge)
			// @ts-expect-error
			navigator.clearAppBadge()

		setupSidebar()
		setupDefaultMenus(this)

		if (import.meta.env.PROD) {
			const socialsMsg = new PersistentNotification({
				id: 'bridge-social-links',
				icon: 'mdi-link-variant',
				message: 'sidebar.notifications.socials.message',
				color: '#1DA1F2',
				textColor: 'white',
				onClick: () => {
					this.windows.socialsWindow.open()
					socialsMsg.dispose()
				},
			})

			const gettingStarted = new PersistentNotification({
				id: 'bridge-getting-started',
				icon: 'mdi-help-circle-outline',
				message: 'sidebar.notifications.gettingStarted.message',
				onClick: () => {
					App.openUrl(
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

		this.locales.setDefaultLanguage()

		await Promise.all([
			// Create default folders
			this.fileSystem.mkdir('projects'),
			this.fileSystem.mkdir('extensions'),
			this.fileSystem.mkdir('data'),

			// Setup data helpers
			App.fileType.setup(this.dataLoader),
			App.packType.setup(this.dataLoader),
		])

		// Ensure that a project is selected
		this.projectManager.projectReady.fired.then(async () =>
			// Then load global extensions
			this.extensionLoader.loadExtensions()
		)

		console.timeEnd('[APP] startUp()')
	}

	public readonly bridgeFolderSetup = new Signal<void>()
	async setupBridgeFolder(forceReselect = false) {
		let fileHandle = await get<AnyDirectoryHandle | undefined>(
			'bridgeBaseDir'
		)

		if (fileHandle && !forceReselect) {
			const permissionState = await fileHandle.requestPermission({
				mode: 'readwrite',
			})
			if (permissionState !== 'granted') return false
		} else {
			try {
				fileHandle = await window.showDirectoryPicker({
					mode: 'readwrite',
				})
			} catch {
				return false
			}

			await set('bridgeBaseDir', fileHandle)
		}

		this.fileSystem.setup(fileHandle)

		// Migrate old settings over to ~local/data/settings.json
		if (await this.fileSystem.fileExists('data/settings.json')) {
			await this.fileSystem.copyFile(
				'data/settings.json',
				'~local/data/settings.json'
			)
			await this.fileSystem.unlink('data/settings.json')
			await SettingsWindow.loadSettings(this).then(async () => {
				this.themeManager.loadDefaultThemes(this)
			})
		}

		this.bridgeFolderSetup.dispatch()
		await this.projectManager.loadProjects(true)

		return true
	}
}
