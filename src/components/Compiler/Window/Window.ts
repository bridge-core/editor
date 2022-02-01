import { Sidebar, SidebarItem } from '/@/components/Windows/Layout/Sidebar'
import { BaseWindow } from '/@/components/Windows/BaseWindow'
import Content from './Content.vue'
import BuildProfiles from './BuildProfiles.vue'
import Logs from './Logs.vue'
import OutputFolders from './OutputFolders.vue'
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { App } from '/@/App'
import { markRaw, ref } from '@vue/composition-api'
import json5 from 'json5'
import { proxy } from 'comlink'
import { InfoPanel, IPanelOptions } from '../../InfoPanel/InfoPanel'
import { isUsingFileSystemPolyfill } from '../../FileSystem/Polyfill'

export class CompilerWindow extends BaseWindow {
	protected sidebar = new Sidebar([], false)
	protected categories = markRaw<
		Record<string, { component: any; data: any }>
	>({
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

	constructor() {
		super(Content, false, true)
		this.defineWindow()

		this.actions.push(
			new SimpleAction({
				icon: 'mdi-refresh',
				name: 'general.reload',
				color: 'accent',
				onTrigger: () => {
					this.reload()
				},
			})
		)

		App.getApp().then((app) => {
			const loc = app.locales

			this.sidebar.addElement(
				new SidebarItem({
					id: 'buildProfiles',
					text: loc.translate('sidebar.compiler.categories.profiles'),
					color: 'primary',
					icon: 'mdi-motion-play-outline',
				})
			)
			this.sidebar.addElement(
				new SidebarItem({
					id: 'outputFolders',
					text: loc.translate(
						'sidebar.compiler.categories.outputFolders'
					),
					color: 'primary',
					icon: 'mdi-folder-open-outline',
				})
			)
			this.sidebar.addElement(
				new SidebarItem({
					id: 'logs',
					text: loc.translate(
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
		this.categories.logs.data.value = await app.project.compilerService.getCompilerLogs()
		this.categories.outputFolders.data.value = await this.loadOutputFolders()
	}
	async open() {
		const app = await App.getApp()

		await this.reload()
		await app.project.compilerService.onConsoleUpdate(
			proxy(async () => {
				this.categories.logs.data.value = await app.project.compilerService.getCompilerLogs()
			})
		)

		super.open()
	}
	async close() {
		const app = await App.getApp()
		await app.project.compilerService.removeConsoleListeners()

		super.close()
	}

	async loadProfiles() {
		const app = await App.getApp()
		const project = app.project

		const configDir = await project.fileSystem.getDirectoryHandle(
			`.bridge/compiler`,
			{ create: true }
		)

		const actions = [
			{
				icon: 'mdi-cog',
				name: 'sidebar.compiler.default.name',
				description: 'sidebar.compiler.default.description',
				onTrigger: async () => {
					this.close()

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
				onTrigger: async () => {
					this.close()

					const service = await project.createDashService(
						'production',
						`projects/${project.name}/.bridge/compiler/${entry.name}`
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