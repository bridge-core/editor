import { Sidebar, SidebarItem } from '/@/components/Windows/Layout/Sidebar'
import Content from './Content.vue'
import BuildProfiles from './BuildProfiles.vue'
import Logs from './Logs.vue'
import OutputFolders from './OutputFolders.vue'
import WatchMode from './WatchMode.vue'
import { IActionConfig, SimpleAction } from '/@/components/Actions/SimpleAction'
import { App } from '/@/App'
import { markRaw, ref } from 'vue'
import json5 from 'json5'
import { proxy } from 'comlink'
import { InfoPanel, IPanelOptions } from '/@/components/InfoPanel/InfoPanel'
import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'
import { restartWatchModeAction } from '../Actions/RestartWatchMode'
import { SettingsWindow } from '../../Windows/Settings/SettingsWindow'
import { LocaleManager } from '../../Locales/Manager'
import { NewBaseWindow } from '../../Windows/NewBaseWindow'

export class CompilerWindow extends NewBaseWindow {
	protected sidebar = new Sidebar([], false)
	protected categories = markRaw<
		Record<string, { component: any; data: any }>
	>({
		watchMode: {
			component: WatchMode,
			data: ref({
				shouldSaveSettings: false,
			}),
		},
		buildProfiles: {
			component: BuildProfiles,
			data: ref(null),
		},
		outputFolders: {
			component: OutputFolders,
			data: ref(null),
		},
		logs: {
			component: Logs,
			data: ref(null),
		},
	})
	public readonly activeCategoryChanged = markRaw(
		new EventDispatcher<string | undefined>()
	)
	protected lastUsedBuildProfile: SimpleAction | null = null
	protected runLastProfileAction = new SimpleAction({
		name: 'sidebar.compiler.actions.runLastProfile',
		icon: 'mdi-play',
		color: 'accent',
		onTrigger: () => {
			if (!this.lastUsedBuildProfile)
				throw new Error(
					`Invalid state: Triggered runLastProfileAction without a last used build profile`
				)
			this.lastUsedBuildProfile.trigger()
		},
	})

	constructor() {
		super(Content, false, true)
		this.defineWindow()

		const reloadAction = new SimpleAction({
			icon: 'mdi-refresh',
			name: 'general.reload',
			color: 'accent',
			onTrigger: () => {
				this.reload()
			},
		})
		this.state.actions.push(reloadAction)

		const clearConsoleAction = new SimpleAction({
			icon: 'mdi-close-circle-outline',
			name: 'general.clear',
			color: 'accent',
			onTrigger: async () => {
				const app = await App.getApp()
				app.project.compilerService.clearCompilerLogs()
				this.categories.logs.data.value = []
			},
		})
		this.sidebar.on((selected) => {
			this.activeCategoryChanged.dispatch(selected)

			if (selected === 'logs')
				this.state.actions.splice(
					this.state.actions.indexOf(reloadAction),
					0,
					clearConsoleAction
				)
			else
				this.state.actions = this.state.actions.filter(
					(a) => a !== clearConsoleAction
				)
		})
		// Close this window whenever the watch mode is restarted
		restartWatchModeAction.on(() => this.close())

		App.getApp().then(() => {
			this.sidebar.addElement(
				new SidebarItem({
					id: 'watchMode',
					text: LocaleManager.translate(
						'sidebar.compiler.categories.watchMode.name'
					),
					color: 'primary',
					icon: 'mdi-eye-outline',
				})
			)
			this.sidebar.addElement(
				new SidebarItem({
					id: 'buildProfiles',
					text: LocaleManager.translate(
						'sidebar.compiler.categories.profiles'
					),
					color: 'primary',
					icon: 'mdi-motion-play-outline',
				})
			)
			this.sidebar.addElement(
				new SidebarItem({
					id: 'outputFolders',
					text: LocaleManager.translate(
						'sidebar.compiler.categories.outputFolders'
					),
					color: 'primary',
					icon: 'mdi-folder-open-outline',
				})
			)
			this.sidebar.addElement(
				new SidebarItem({
					id: 'logs',
					text: LocaleManager.translate(
						'sidebar.compiler.categories.logs.name'
					),
					color: 'primary',
					icon: 'mdi-format-list-text',
				})
			)
			this.sidebar.setDefaultSelected()
		})
	}

	async reload() {
		const app = await App.getApp()

		this.categories.buildProfiles.data.value = await this.loadProfiles()
		this.categories.logs.data.value =
			await app.project.compilerService.getCompilerLogs()
		this.categories.outputFolders.data.value =
			await this.loadOutputFolders()
	}
	async open() {
		const app = await App.getApp()

		await this.reload()
		await app.project.compilerService.onConsoleUpdate(
			proxy(async () => {
				this.categories.logs.data.value =
					await app.project.compilerService.getCompilerLogs()
			})
		)

		if (this.lastUsedBuildProfile)
			this.state.actions.unshift(this.runLastProfileAction)

		super.open()
	}
	async close() {
		const app = await App.getApp()
		await app.project.compilerService.removeConsoleListeners()

		this.state.actions = this.state.actions.filter(
			(a) => a !== this.runLastProfileAction
		)

		super.close()

		if (this.categories.watchMode.data.value.shouldSaveSettings) {
			this.categories.watchMode.data.value.shouldSaveSettings = false
			await SettingsWindow.saveSettings()
		}
	}

	async loadProfiles() {
		const app = await App.getApp()
		const project = app.project

		const configDir = await project.fileSystem.getDirectoryHandle(
			`.bridge/compiler`,
			{ create: true }
		)

		const actions: IActionConfig[] = [
			{
				icon: 'mdi-cog',
				name: 'sidebar.compiler.default.name',
				description: 'sidebar.compiler.default.description',
				onTrigger: async (action) => {
					this.close()
					this.lastUsedBuildProfile = action

					const service = await project.createDashService(
						'production'
					)
					await service.setup()
					await service.build()
				},
			},
		]

		for await (const entry of configDir.values()) {
			if (
				entry.kind !== 'file' ||
				entry.name === '.DS_Store' ||
				entry.name === 'default.json' // Default compiler config already gets triggerd with the default action above (outside of the loop)
			)
				continue
			const file = await entry.getFile()

			let config
			try {
				config = json5.parse(await file.text())
			} catch {
				continue
			}

			actions.push({
				icon: config.icon,
				name: config.name,
				description: config.description,
				onTrigger: async (action) => {
					this.close()
					this.lastUsedBuildProfile = action

					const service = await project.createDashService(
						'production',
						`${project.projectPath}/.bridge/compiler/${entry.name}`
					)
					await service.setup()
					await service.build()
				},
			})
		}

		return actions.map((action) => new SimpleAction(action))
	}

	async loadOutputFolders() {
		const app = await App.getApp()

		const comMojang = app.comMojang
		const { hasComMojang, didDenyPermission } = comMojang.status
		let panelConfig: IPanelOptions

		if (isUsingFileSystemPolyfill.value) {
			panelConfig = {
				text: 'comMojang.status.notAvailable',
				type: 'error',
				isDismissible: false,
			}
		} else if (!hasComMojang && didDenyPermission) {
			panelConfig = {
				text: 'comMojang.status.deniedPermission',
				type: 'warning',
				isDismissible: false,
			}
		} else if (hasComMojang && !didDenyPermission) {
			panelConfig = {
				text: 'comMojang.status.sucess',
				type: 'success',
				isDismissible: false,
			}
		} else if (!hasComMojang) {
			panelConfig = {
				text: 'comMojang.status.notSetup',
				type: 'error',
				isDismissible: false,
			}
		} else {
			throw new Error(`Invalid com.mojang status`)
		}

		return new InfoPanel(panelConfig)
	}
}
