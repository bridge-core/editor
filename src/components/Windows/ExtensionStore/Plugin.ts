import { App } from '@/App'
import { IExtensionManifest } from '@/components/Extensions/ExtensionLoader'
import { selectedProject } from '@/components/Project/Loader'
import { InformedChoiceWindow } from '@/components/Windows/InformedChoice/InformedChoice'
import { ExtensionStoreWindow } from './ExtensionStore'
import { PluginTag } from './PluginTag'

export class Plugin {
	protected tags: PluginTag[]
	protected isLoading = false
	protected isInstalled = false
	protected isActive = false

	constructor(
		protected parent: ExtensionStoreWindow,
		protected config: IExtensionManifest
	) {
		this.tags = this.config.tags.map(tag => {
			if (!this.parent.tags[tag])
				this.parent.tags[tag] = new PluginTag(this.parent, tag)
			return this.parent.tags[tag]
		})
	}

	//#region Config getters
	get author() {
		return this.config.author
	}
	get name() {
		return this.config.name
	}
	get version() {
		return this.config.version
	}
	get description() {
		return this.config.description
	}
	get icon() {
		return this.config.icon
	}
	get id() {
		return this.config.id
	}
	//#endregion

	hasTag(tag: PluginTag) {
		return this.tags.includes(tag)
	}

	async download() {
		const installLocationChoiceWindow = new InformedChoiceWindow(
			'windows.pluginInstallLocation.title'
		)
		const actionManager = await installLocationChoiceWindow.actionManager
		actionManager.create({
			icon: 'mdi-folder-multiple-outline',
			name: 'actions.pluginInstallLocation.global.name',
			description: 'actions.pluginInstallLocation.global.description',
			onTrigger: () => {
				this.downloadPlugin(true)
			},
		})
		actionManager.create({
			icon: 'mdi-folder-outline',
			name: 'actions.pluginInstallLocation.local.name',
			description: 'actions.pluginInstallLocation.local.description',
			onTrigger: () => {
				this.downloadPlugin(false)
			},
		})
	}

	protected async downloadPlugin(isGlobalInstall: boolean) {
		this.isLoading = true

		const app = await App.getApp()
		const zip = await fetch(
			this.parent.getBaseUrl() + this.config.link
		).then(response => response.arrayBuffer())

		const basePath = !isGlobalInstall
			? `projects/${selectedProject}/bridge/`
			: ''
		await app.fileSystem.writeFile(
			basePath + `plugins/${this.name.replace(/\s+/g, '')}.zip`,
			zip
		)

		this.isLoading = false
	}
}
