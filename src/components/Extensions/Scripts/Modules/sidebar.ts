import { IModuleConfig } from '../types'
import { createSidebar } from '../../../Sidebar/SidebarElement'
import { SettingsWindow } from '/@/components/Windows/Settings/SettingsWindow'
import { Component } from 'vue'
import { SidebarContent } from '/@/components/Sidebar/Content/SidebarContent'
import { SidebarAction } from '/@/components/Sidebar/Content/SidebarAction'
import { SelectableSidebarAction } from '/@/components/Sidebar/Content/SelectableSidebarAction'

export const SidebarModule = ({ disposables, extensionId }: IModuleConfig) => ({
	SidebarContent,
	SidebarAction,
	SelectableSidebarAction,

	create(config: {
		id?: string
		displayName: string
		component: Component
		icon: string
	}) {
		if (!config.id) {
			console.error('SidebarModule: config.id is required')
			config.id = `${extensionId}//${config.displayName}`
		}
		const sidebar = createSidebar(config)

		if (config.id) {
			SettingsWindow.loadedSettings.once((settingsState) => {
				sidebar.isVisibleSetting =
					(<any>settingsState)?.sidebar?.sidebarElements?.[
						config.id!
					] ?? true
			})
		}

		disposables.push(sidebar)
		return sidebar
	},

	getSelected() {
		throw new Error(`This function no longer works with bridge. v2`)
	},
	onChange() {
		throw new Error(`This function no longer works with bridge. v2`)
	},
	select() {
		throw new Error(`This function no longer works with bridge. v2`)
	},
})
