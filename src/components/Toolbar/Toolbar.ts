import { SettingsWindow } from '@/components/Windows/Settings/SettingsWindow'

type ToolbarItem = Button | Dropdown

interface Button {
	type: 'button'
	name: string
	action: () => void
}

interface Dropdown {
	type: 'dropdown'
	name: string
	items: DropdownItem[]
}

type DropdownItem = DropdownButton | Seperator

interface DropdownButton {
	type: 'button'
	action: string
}

interface Seperator {
	type: 'seperator'
}

export class Toolbar {
	public static items: ToolbarItem[] = []

	public static setup() {
		this.items = []

		this.addDropdown('toolbar.project.name', [
			{ type: 'button', action: 'goHome' },
			{ type: 'button', action: 'chooseProject' },
			{ type: 'button', action: 'launchMinecraft' },
			{ type: 'seperator' },
			{ type: 'button', action: 'newProject' },
			{ type: 'button', action: 'importProject' },
			{ type: 'seperator' },
			{
				type: 'button',
				action: 'openExtensions',
			},
			{
				type: 'button',
				action: 'openSettings',
			},
		])

		this.addButton('toolbar.settings.name', () => SettingsWindow.open())

		this.addDropdown('toolbar.file.name', [
			{ type: 'button', action: 'newFile' },
			{ type: 'button', action: 'openFile' },
			{ type: 'button', action: 'openFolder' },
			{ type: 'button', action: 'searchFile' },
			{ type: 'button', action: 'closeFile' },
			{ type: 'seperator' },
			{ type: 'button', action: 'save' },
			{ type: 'button', action: 'saveAs' },
			{ type: 'button', action: 'saveAll' },
		])

		this.addDropdown('toolbar.tools.name', [
			{ type: 'button', action: 'openBedrockDev' },
			{ type: 'button', action: 'openMinecraftDocumentation' },
			{ type: 'button', action: 'openBlockbench' },
			{ type: 'button', action: 'openSnowstorm' },
			{ type: 'button', action: 'reload' },
			{ type: 'seperator' },
			{ type: 'button', action: 'clearNotifications' },
		])

		this.addDropdown('toolbar.help.name', [
			{ type: 'button', action: 'about' },
			{ type: 'button', action: 'releases' },
			{ type: 'button', action: 'bugReports' },
			{ type: 'button', action: 'twitter' },
			{ type: 'seperator' },
			{ type: 'button', action: 'extensionAPI' },
			{ type: 'button', action: 'gettingStarted' },
			{ type: 'button', action: 'faq' },
		])

		this.addButton('toolbar.download.name', () => {
			window.open('https://bridge-core.app/guide/download/')
		})
	}

	public static addButton(name: string, action: () => void) {
		this.items.push({ type: 'button', name, action } as Button)
	}

	public static addDropdown(name: string, items: DropdownItem[]) {
		this.items.push({ type: 'dropdown', name, items } as Dropdown)
	}
}
