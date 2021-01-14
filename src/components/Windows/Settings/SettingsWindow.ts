import { createWindow } from '../create'
import { SidebarItem } from '../Layout/Sidebar'
import { Control } from './Controls/Control'
import SettingsWindowComponent from './SettingsWindow.vue'
import { setupSettings } from './setupSettings'
import Vue from 'vue'
import { App } from '@/App'
import { SettingsSidebar } from './SettingsSidebar'

export let settingsState: Record<
	string,
	Record<string, unknown>
> = Vue.observable({})
export class SettingsWindow {
	protected sidebar = new SettingsSidebar([])
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
		settingsState[id] = {}
		this.sidebar.addElement(
			new SidebarItem({
				color: 'primary',
				text: name,
				icon,
				id,
			}),
			[]
		)
	}

	addControl(control: Control<any>) {
		const category = <Control<any>[]>(
			this.sidebar.state[control.config.category]
		)
		if (!category)
			throw new Error(
				`Undefined settings category: ${control.config.category}`
			)

		category.push(control)
		control.setParent(this)
	}

	saveSettings() {
		return new Promise<void>(resolve => {
			App.ready.once(async app => {
				await app.fileSystem.writeJSON(
					'data/settings.json',
					settingsState
				)
				resolve()
			})
		})
	}
	loadSettings() {
		return new Promise<void>(resolve => {
			App.ready.once(async app => {
				try {
					settingsState = Vue.observable(
						await app.fileSystem.readJSON('data/settings.json')
					)
				} catch {
					settingsState = Vue.observable({})
				}

				resolve()
			})
		})
	}

	async open() {
		await this.loadSettings()
		this.window = createWindow(SettingsWindowComponent, {
			sidebar: this.sidebar,
			settingsState,
		})
		this.window.open()
	}
	close() {
		this.window.close()
	}
}
