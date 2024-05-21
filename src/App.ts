import '/@/components/Notifications/Errors'
import '/@/components/Languages/LanguageManager'

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
import { ComMojang } from './components/OutputFolders/ComMojang/ComMojang'
import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { markRaw } from 'vue'
import { ConfiguredJsonLanguage } from '/@/components/Languages/Json/Main'
import { WindowState } from '/@/components/Windows/WindowState'
import { Mobile } from '/@/components/App/Mobile'
import { PackExplorer } from '/@/components/PackExplorer/PackExplorer'
import { PersistentNotification } from '/@/components/Notifications/PersistentNotification'
import { version as appVersion } from '/@/utils/app/version'
import { platform } from '/@/utils/os'
import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { getStorageDirectory } from '/@/utils/getStorageDirectory'
import { FolderImportManager } from '/@/components/ImportFolder/Manager'
import { StartParamManager } from '/@/components/StartParams/Manager'
import { ViewFolders } from '/@/components/ViewFolders/ViewFolders'
import { SidebarManager } from '/@/components/Sidebar/Manager'
import { ViewComMojangProject } from '/@/components/OutputFolders/ComMojang/Sidebar/ViewProject'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'
import { BottomPanel } from '/@/components/BottomPanel/BottomPanel'
import { SolidWindowManager } from './components/Solid/Window/Manager'
import { setupActions } from './components/Actions/Actions'
import { createNotification } from './components/Notifications/create'

if (import.meta.env.VITE_IS_TAURI_APP) {
	// Import Tauri updater for native builds
	import('./components/App/Tauri/TauriUpdater')
} else {
	// Only import service worker for non-Tauri builds
	import('/@/components/App/ServiceWorker')
}

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
		'beforeFileSave',
		'fileSave',
		'fileUnlinked',
		'presetsChanged',
		'availableProjectsFileChanged',
		'beforeModifiedProject',
		'modifiedProject',
	])
	public static readonly ready = new Signal<App>()
	protected static _instance: Readonly<App>

	public readonly viewFolders = new ViewFolders()
	public readonly viewComMojangProject = new ViewComMojangProject()
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
	public readonly contextMenu = markRaw(new ContextMenu())
	public readonly fileDropper = new FileDropper(this)
	public readonly fileImportManager = new FileImportManager(this.fileDropper)
	public readonly folderImportManager = new FolderImportManager()
	public readonly comMojang = new ComMojang(this)
	public readonly configuredJsonLanguage = markRaw(
		new ConfiguredJsonLanguage()
	)
	public static readonly fileType = markRaw(new FileTypeLibrary())
	public static readonly packType = markRaw(new PackTypeLibrary())
	public static readonly sidebar = new SidebarManager()
	public static readonly bottomPanel = markRaw(new BottomPanel())
	public static readonly solidWindows = markRaw(new SolidWindowManager())

	public readonly mobile: Mobile

	public readonly languageManager = markRaw(new LanguageManager())
	// App start params
	public readonly startParams = new StartParamManager()

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
		return Object.values(this.projectManager.state).filter(
			(project) => !project.isVirtualProject
		)
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
		this._windows = new Windows(this)

		this.mobile = new Mobile(appComponent.$vuetify)

		// Prompt the user whether they really want to close bridge. when unsaved tabs are open
		const saveWarning =
			'Are you sure that you want to close bridge.? Unsaved progress will be lost.'
		// Only prompt in prod mode so we can use HMR in dev mode
		if (import.meta.env.PROD) {
			window.addEventListener('beforeunload', (event) => {
				if (this.shouldWarnBeforeClose) {
					event.preventDefault()
					event.returnValue = saveWarning
					return saveWarning
				}
			})
		}
	}

	get shouldWarnBeforeClose() {
		if (
			!import.meta.env.VITE_IS_TAURI_APP &&
			isUsingFileSystemPolyfill.value
		)
			return true

		return (
			this.tabSystem?.hasUnsavedTabs || this.taskManager.hasRunningTasks
		)
	}

	static async openUrl(url: string, id?: string, openInBrowser = false) {
		if (import.meta.env.VITE_IS_TAURI_APP) {
			const { open } = await import('@tauri-apps/api/shell')

			return open(url)
		}

		if (settingsState?.general?.openLinksInBrowser || openInBrowser)
			return window.open(url, '_blank')
		return window.open(url, id, 'toolbar=no,menubar=no,status=no')
	}

	/**
	 * Starts the app
	 */
	static async main(appComponent: Vue) {
		console.time('[APP] Ready')

		this._instance = markRaw(new App(appComponent))

		await this.instance.beforeStartUp()

		this.instance.fileSystem.setup(await getStorageDirectory())

		if (import.meta.env.VITE_IS_TAURI_APP) {
			// TauriFs env -> bridge. folder is the same as getStorageDirectory()
			await this.instance.bridgeFolderSetup.dispatch()
			// Setup com.mojang folder
			await this.instance.comMojang.setupComMojang()
			// Load projects
			this.instance.projectManager.loadProjects(true).then(() => {
				this.instance.themeManager.updateTheme()
			})
		}

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
		if (navigator.clearAppBadge) navigator.clearAppBadge()

		setupSidebar()
		setupDefaultMenus(this)
		setupActions(this)

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

		// Warn about saving projects
		if (
			isUsingFileSystemPolyfill.value &&
			!import.meta.env.VITE_IS_TAURI_APP
		) {
			const saveWarning = new PersistentNotification({
				id: 'bridge-save-warning',
				icon: 'mdi-alert-circle-outline',
				message: 'general.fileSystemPolyfill.name',
				color: 'warning',
				textColor: 'white',
				onClick: () => {
					new InformationWindow({
						title: 'general.fileSystemPolyfill.name',
						description: 'general.fileSystemPolyfill.description',
					})
					saveWarning.dispose()
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
			this.fileSystem.mkdir('extensions'),
			this.fileSystem.mkdir('data'),

			// Setup data helpers
			App.fileType.setup(this.dataLoader),
			App.packType.setup(this.dataLoader),
		])

		// Ensure that a project is selected
		this.projectManager.projectReady.fired.then(async () => {
			// Then load global extensions
			this.extensionLoader.loadExtensions()
		})

		console.timeEnd('[APP] startUp()')
	}

	public readonly bridgeFolderSetup = new Signal<void>()
	async setupBridgeFolder(forceReselect = false) {
		if (!forceReselect && this.bridgeFolderSetup.hasFired) return true

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

		await this.extensionLoader.loadExtensions()
		await this.themeManager.updateTheme()

		return true
	}
}
