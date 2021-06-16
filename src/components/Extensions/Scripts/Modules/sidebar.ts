import { IModuleConfig } from '../types'
import { createSidebar } from '/@/components/Sidebar/create'
import { selectSidebar } from '/@/components/Sidebar/state'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { SettingsWindow } from '/@/components/Windows/Settings/SettingsWindow'

export const SidebarModule = ({ disposables }: IModuleConfig) => ({
	create(config: {
		id?: string
		displayName: string
		component: string
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
	select: selectSidebar,
})
