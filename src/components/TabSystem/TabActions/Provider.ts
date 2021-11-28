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
	isDisabled?: (tab: FileTab) => boolean
}

export interface ITabPreviewConfig {
	name: string
	/**
	 * @deprecated Deprecated in favor of matching by file type
	 */
	fileMatch?: string
	fileType: string
	createPreview(tabSystem: TabSystem, tab: FileTab): Promise<Tab | undefined>
}

export class TabActionProvider {
	protected definitions = new Set<ITabActionConfig>()
	protected processedFileTabs = new Set<FileTab>()

	register(definition: ITabActionConfig) {
		this.definitions.add(definition)

		// Update current tabs
		this.processedFileTabs.forEach((fileTab) => {
			if (definition.isFor(fileTab))
				fileTab.addAction(
					new SimpleAction({
						icon: definition.icon,
						name: definition.name,
						isDisabled: () =>
							definition.isDisabled?.(fileTab) ?? false,
						onTrigger: () => definition.trigger(fileTab),
					})
				)
		})

		return {
			dispose: () => {
				this.definitions.delete(definition)

				// Update current tabs
				this.processedFileTabs.forEach((fileTab) => {
					if (definition.isFor(fileTab)) {
						fileTab.clearActions()
						this.addTabActions(fileTab)
					}
				})
			},
		}
	}
	registerPreview(definition: ITabPreviewConfig) {
		return this.register({
			icon: 'mdi-play',
			name: definition.name,
			isFor: (fileTab) => {
				if (!(fileTab instanceof FileTab)) return false
				else if (definition.fileType)
					return fileTab.getFileType() === definition.fileType
				else if (definition.fileMatch)
					return fileTab
						.getProjectPath()
						.startsWith(definition.fileMatch)

				return false
			},
			trigger: async (fileTab) => {
				const app = await App.getApp()

				const previewTab = await definition.createPreview(
					app.project.inactiveTabSystem!,
					fileTab
				)
				if (!previewTab) return

				previewTab.isTemporary = false
				fileTab.connectedTabs.push(previewTab)

				app.project.inactiveTabSystem?.add(previewTab, true)
				app.project.inactiveTabSystem?.setActive(true)
			},
		})
	}

	async addTabActions(fileTab: FileTab) {
		this.processedFileTabs.add(fileTab)
		fileTab.onClose.on(() => this.processedFileTabs.delete(fileTab))

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
