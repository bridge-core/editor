import { ExtensionStoreWindow, ILoadedPlugin } from './ExtensionStore'
import { PluginTag } from './PluginTag'

export class Plugin {
	protected tags: PluginTag[]

	constructor(
		protected parent: ExtensionStoreWindow,
		protected config: ILoadedPlugin
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
}
