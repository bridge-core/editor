import { IModuleConfig } from '../types'
import { App } from '/@/App'
import { Tab } from '/@/components/TabSystem/CommonTab'
import { FileTab } from '/@/components/TabSystem/FileTab'
import { TabProvider } from '/@/components/TabSystem/TabProvider'

export const TabModule = async ({ disposables }: IModuleConfig) => ({
	ContentTab: Tab,
	FileTab,

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
	 */
	openTab: async (FileTabClass: typeof Tab, splitScreen = false) => {
		const app = await App.getApp()
		const project = app.project

		if (splitScreen) {
			// @ts-ignore
			const tab = new FileTabClass(project.inactiveTabSystem!)

			project.inactiveTabSystem?.add(tab, true)
			project.inactiveTabSystem?.setActive(true)

			return tab
		} else {
			// @ts-ignore
			const tab = new FileTabClass(project.tabSystem!)

			project.tabSystem?.add(tab, true)

			return tab
		}
	},
})
