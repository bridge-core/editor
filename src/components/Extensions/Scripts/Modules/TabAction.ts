import { IModuleConfig } from '../types'
import { App } from '/@/App'
import type { Project } from '/@/components/Projects/Project/Project'
import { FileTab } from '/@/components/TabSystem/FileTab'
import {
	ITabActionConfig,
	ITabPreviewConfig,
} from '/@/components/TabSystem/TabActions/Provider'
import { IDisposable } from '/@/types/disposable'

interface IForEachProjectConfig {
	app: App
	disposables: IDisposable[]
	isGlobal: boolean
	func: (project: Project) => void
}

// Call a function for every current project and projects newly added in the future
function forEachProject({
	isGlobal,
	func,
	disposables,
	app,
}: IForEachProjectConfig) {
	if (isGlobal) {
		app.projects.forEach(func)
		disposables.push(app.projectManager.addedProject.on(func))
	} else {
		func(app.project)
	}
}

export const TabActionsModule = async ({
	disposables,
	isGlobal,
}: IModuleConfig) => ({
	/**
	 * Add the default tab actions for the specific file tab
	 * @param tab
	 */
	addTabActions: async (tab: FileTab) => {
		const app = await App.getApp()

		app.project.tabActionProvider.addTabActions(tab)
	},

	/**
	 * Register a new tab action
	 * @param definition
	 * @returns Disposable
	 */
	register: async (definition: ITabActionConfig) => {
		const app = await App.getApp()

		forEachProject({
			app,
			disposables,
			isGlobal,
			func: (project) => {
				disposables.push(project.tabActionProvider.register(definition))
			},
		})
	},

	/**
	 * Register a new tab preview
	 * @param definition
	 * @returns Disposable
	 */
	registerPreview: async (definition: ITabPreviewConfig) => {
		const app = await App.getApp()

		forEachProject({
			app,
			disposables,
			isGlobal,
			func: (project) => {
				disposables.push(
					project.tabActionProvider.registerPreview(definition)
				)
			},
		})
	},
})
