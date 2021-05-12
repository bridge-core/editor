import { App } from '/@/App'
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { Tab } from '../CommonTab'
import { FileTab } from '/@/components/TabSystem/FileTab'
import { TabSystem } from '../TabSystem'

export interface ITabActionConfig {
	icon: string
	name: string
	trigger(tab: FileTab): Promise<void> | void
	isFor(tab: FileTab): Promise<boolean> | boolean
}

export interface ITabPreviewConfig {
	name: string
	fileMatch: string
	createPreview(tabSystem: TabSystem, tab: FileTab): Promise<Tab | undefined>
}

export class TabActionProvider {
	protected definitions = new Set<ITabActionConfig>()

	register(definition: ITabActionConfig) {
		this.definitions.add(definition)

		return {
			dispose: () => this.definitions.delete(definition),
		}
	}
	async registerPreview(definition: ITabPreviewConfig) {
		this.register({
			icon: 'mdi-play',
			name: definition.name,
			isFor: (fileTab) =>
				fileTab.getProjectPath().startsWith(definition.fileMatch),
			trigger: async (fileTab) => {
				const app = await App.getApp()

				const previewTab = await definition.createPreview(
					app.project.inactiveTabSystem!,
					fileTab
				)
				if (!previewTab) return

				fileTab.connectedTabs.push(previewTab)

				app.project.inactiveTabSystem?.add(previewTab, true)
				app.project.inactiveTabSystem?.setActive(true)
			},
		})
	}

	async addTabActions(fileTab: FileTab) {
		for (const def of this.definitions) {
			if (await def.isFor(fileTab))
				fileTab.addAction(
					new SimpleAction({
						icon: def.icon,
						name: def.name,
						onTrigger: () => def.trigger(fileTab),
					})
				)
		}
	}
}
