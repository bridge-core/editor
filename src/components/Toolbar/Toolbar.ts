import { Ref, ref } from 'vue'

type ToolbarItem = Button | Dropdown

export interface Button {
	type: 'button'
	action: string
}

export interface Dropdown {
	type: 'dropdown'
	id: string
	name: string
	items: DropdownItem[]
}

export type DropdownItem = DropdownButton | Seperator

interface DropdownButton {
	type: 'button'
	action: string
}

interface Seperator {
	type: 'seperator'
}

export class Toolbar {
	public static items: Ref<ToolbarItem[]> = ref([])

	public static setup() {
		this.items.value = []

		this.addDropdown('project', 'toolbar.project.name', [
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

		this.addButton('openSettings')

		this.addDropdown('file', 'toolbar.file.name', [
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

		this.addDropdown('tools', 'toolbar.tools.name', [
			{ type: 'button', action: 'openBedrockDev' },
			{ type: 'button', action: 'openMinecraftDocumentation' },
			{ type: 'button', action: 'openBlockbench' },
			{ type: 'button', action: 'openSnowstorm' },
			{ type: 'button', action: 'reload' },
			{ type: 'seperator' },
			{ type: 'button', action: 'clearNotifications' },
		])

		this.addDropdown('help', 'toolbar.help.name', [
			{ type: 'button', action: 'about' },
			{ type: 'button', action: 'releases' },
			{ type: 'button', action: 'bugReports' },
			{ type: 'button', action: 'twitter' },
			{ type: 'seperator' },
			{ type: 'button', action: 'extensionAPI' },
			{ type: 'button', action: 'gettingStarted' },
			{ type: 'button', action: 'faq' },
		])

		this.addButton('openDownloadGuide')
	}

	public static addButton(action: string): Button {
		const item: Button = { type: 'button', action }

		this.items.value.push(item)

		return item
	}

	public static addDropdown(id: string, name: string, items: DropdownItem[]): Dropdown {
		const item: Dropdown = { type: 'dropdown', id, name, items }

		this.items.value.push(item)

		return item
	}

	public static addDropdownItem(dropdownId: string, item: DropdownItem) {
		const dropdown = this.items.value.find((item) => item.type === 'dropdown' && item.id === dropdownId) as Dropdown | undefined

		if (!dropdown) return

		dropdown.items.push(item)
	}

	public static removeButton(button: Button) {
		this.items.value.splice(this.items.value.indexOf(button), 1)
	}

	public static removeDropdown(dropdown: Dropdown) {
		this.items.value.splice(this.items.value.indexOf(dropdown), 1)
	}

	public static removeDropdownItem(dropdownId: string, item: DropdownItem) {
		const dropdown = this.items.value.find((item) => item.type === 'dropdown' && item.id === dropdownId) as Dropdown | undefined

		if (!dropdown) return

		dropdown.items.splice(dropdown.items.indexOf(item), 1)
	}
}
