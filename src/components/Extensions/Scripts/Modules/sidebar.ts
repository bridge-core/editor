import { IModuleConfig } from '../types'
import { createSidebar } from '/@/components/Sidebar/create'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { SettingsWindow } from '/@/components/Windows/Settings/SettingsWindow'
import { Component } from 'vue'
import { SidebarContent } from '/@/components/Sidebar/Content/SidebarContent'

export const SidebarModule = ({ disposables }: IModuleConfig) => ({
	SidebarContent,

	create(config: {
		id?: string
		displayName: string
		component: Component
		icon: string
	}) {
		const sidebar = createSidebar({
			...config,
			isVisible: config.id
				? (<any>settingsState)?.sidebar?.sidebarElements?.[config.id] ??
				  true
				: true,
		})

		if (config.id) {
			SettingsWindow.loadedSettings.once((settingsState) => {
				sidebar.isVisible =
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
