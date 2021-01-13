import { createWindow } from '../create'
import { Sidebar, SidebarItem } from '../Layout/Sidebar'
import { IControl } from './Control'
import SettingsWindowComponent from './SettingsWindow.vue'
import { setupSettings } from './setupSettings'

export const settingsState: Record<string, string | number | boolean> = {}
export const settingsControls: Record<string, IControl[]> = {}
export class SettingsWindow {
	protected sidebar = new Sidebar([])
	protected window?: any

	constructor() {
		this.addCategory('general', 'General', 'mdi-circle-outline')
		this.addCategory('appearance', 'Appearance', 'mdi-palette-outline')
		this.addCategory('editor', 'Editor', 'mdi-pencil-outline')
		this.addCategory('keybindings', 'Keybindings', 'mdi-keyboard-outline')
		this.addCategory('extensions', 'Extensions', 'mdi-puzzle-outline')
		this.addCategory('developers', 'Developers', 'mdi-wrench-outline')

		setupSettings(this)
	}

	addCategory(id: string, name: string, icon: string) {
		settingsControls[id] = []
		this.sidebar.addElement(
			new SidebarItem({
				color: 'primary',
				text: name,
				icon,
				id,
			})
		)
	}

	addControl(categoryId: string, control: IControl) {
		const category = settingsControls[categoryId]
		if (!category)
			throw new Error(`Undefined settings category: ${categoryId}`)

		category.push(control)
	}

	open() {
		this.window = createWindow(SettingsWindowComponent, {
			sidebar: this.sidebar,
			controls: settingsControls,
			settingsState,
		})
		this.window.open()
	}
	close() {
		this.window.close()
	}
}
