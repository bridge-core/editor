import { createWindow } from '../create'
import { Sidebar, SidebarItem } from '../Layout/Sidebar'
import SettingsWindowComponent from './SettingsWindow.vue'

export class SettingsWindow {
	protected sidebar = new Sidebar([])
	protected window?: any

	constructor() {
		this.sidebar.addElement(
			new SidebarItem({
				color: 'primary',
				text: 'General',
				icon: 'mdi-circle-outline',
				id: 'general',
			})
		)
		this.sidebar.addElement(
			new SidebarItem({
				color: 'primary',
				text: 'Appearance',
				icon: 'mdi-palette-outline',
				id: 'appearance',
			})
		)
		this.sidebar.addElement(
			new SidebarItem({
				color: 'primary',
				text: 'Editor',
				icon: 'mdi-pencil-outline',
				id: 'editor',
			})
		)
		this.sidebar.addElement(
			new SidebarItem({
				color: 'primary',
				text: 'Keybindings',
				icon: 'mdi-keyboard-outline',
				id: 'keybindings',
			})
		)
		this.sidebar.addElement(
			new SidebarItem({
				color: 'primary',
				text: 'Developers',
				icon: 'mdi-wrench-outline',
				id: 'developers',
			})
		)
	}

	open() {
		this.window = createWindow(SettingsWindowComponent, {
			sidebar: this.sidebar,
		})
		this.window.open()
	}
	close() {
		this.window.close()
	}
}
