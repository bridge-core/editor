import { SidebarItem } from '../Layout/Sidebar'
import { Control } from './Controls/Control'
import SettingsWindowComponent from './SettingsWindow.vue'
import { setupSettings } from './setupSettings'
import { App } from '/@/App'
import { SettingsSidebar } from './SettingsSidebar'
import { setSettingsState, settingsState } from './SettingsState'
import { BaseWindow } from '../BaseWindow'

export class SettingsWindow extends BaseWindow {
	protected sidebar = new SettingsSidebar([])

	constructor(public parent: App) {
		super(SettingsWindowComponent, false, true)
		this.defineWindow()
	}

	async setup() {
		const locales = await App.getApp().then((app) => app.locales)

		this.addCategory(
			'general',
			locales.translate('windows.settings.general.name'),
			'mdi-circle-outline'
		)
		this.addCategory(
			'appearance',
			locales.translate('windows.settings.appearance.name'),
			'mdi-palette-outline'
		)
		this.addCategory('editor', 'Editor', 'mdi-pencil-outline')
		this.addCategory(
			'actions',
			locales.translate('windows.settings.actions.name'),
			'mdi-keyboard-outline'
		)
		// this.addCategory('extensions', 'Extensions', 'mdi-puzzle-outline')
		this.addCategory(
			'developers',
			locales.translate('windows.settings.developer.name'),
			'mdi-wrench-outline'
		)

		await setupSettings(this)
		this.sidebar.setDefaultSelected()
	}

	addCategory(id: string, name: string, icon: string) {
		if (settingsState[id] === undefined) settingsState[id] = {}
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
	}

	static async saveSettings(app?: App) {
		if (!app) app = await App.getApp()

		await app.fileSystem.writeJSON('data/settings.json', settingsState)
	}
	static async loadSettings(app: App) {
		try {
			setSettingsState(
				await app.fileSystem.readJSON('data/settings.json')
			)
		} catch {}
	}

	async open() {
		if (this.isVisible) return

		this.sidebar.removeElements()
		await this.setup()

		super.open()
	}

	async close() {
		super.close()

		const app = await App.getApp()

		app.windows.loadingWindow.open()
		await SettingsWindow.saveSettings()
		app.windows.loadingWindow.close()
	}
}
