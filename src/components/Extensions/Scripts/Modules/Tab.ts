import { IModuleConfig } from '../types'
import { App } from '/@/App'
import { IframeTab } from '/@/components/Editors/IframeTab/IframeTab'
import { ThreePreviewTab } from '/@/components/Editors/ThreePreview/ThreePreviewTab'
import { Tab } from '/@/components/TabSystem/CommonTab'
import { FileTab } from '/@/components/TabSystem/FileTab'
import { TabProvider } from '/@/components/TabSystem/TabProvider'

export const TabModule = async ({ disposables }: IModuleConfig) => {
	const app = await App.getApp()
	const project = () => app.project

	return {
		ContentTab: Tab,
		FileTab,
		ThreePreviewTab,
		IframeTab,

		/**
		 * Register new FileTabs to be picked up by the isTabFor tab system method
		 * @param FileTabClass FileTab class
		 */
		register: (FileTabClass: typeof FileTab) => {
			const disposable = TabProvider.register(FileTabClass)

			disposables.push(disposable)

			return disposable
		},

		/**
		 * Useful for ContentTabs: Programmatically add the tab to the tab system
		 * @param tab Tab to add to the tab system
		 * @deprecated Use TabSystem.addTab(...) instead
		 */
		openTab: async (FileTabClass: typeof Tab, splitScreen = false) => {
			const tabSystem = splitScreen
				? project().inactiveTabSystem
				: project().tabSystem

			if (!tabSystem) return

			// @ts-ignore
			const tab = new FileTabClass(tabSystem)

			if (splitScreen) tabSystem.setActive(true)
			tabSystem.add(tab, true)

			disposables.push({
				dispose: () => tabSystem.remove(tab),
			})

			return tab
		},
		addTab(tab: Tab) {
			const tabSystem = project().tabSystem
			if (!tabSystem) return

			tabSystem.add(tab, true)

			disposables.push({
				dispose: () => tabSystem.remove(tab),
			})
		},
		getCurrentTabSystem() {
			return project().tabSystem
		},

		/**
		 * Given a file path relative to the project root, open the corresponding file inside of bridge.'s tab system
		 * @param filePath File to open
		 * @param selectTab Whether to automatically select the tab
		 */
		openFilePath: async (filePath: string, selectTab = false) => {
			const fileHandle = await project().fileSystem.getFileHandle(
				filePath
			)

			await project().openFile(fileHandle, { selectTab })
		},
	}
}
