import { Ref, ref } from 'vue'

export type ToolbarItem = Button | Dropdown

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
			{ type: 'button', action: 'editor.goHome' },
			{ type: 'button', action: 'editor.launchMinecraft' },
			{ type: 'seperator' },
			{
				type: 'button',
				action: 'editor.openSettings',
			},
			{
				type: 'button',
				action: 'editor.openExtensions',
			},
			{ type: 'seperator' },
			{ type: 'button', action: 'editor.importProject' },
		])

		this.addButton('openSettings')

		this.addDropdown('file', 'toolbar.file.name', [
			{ type: 'button', action: 'files.createFile' },
			{ type: 'seperator' },
			{ type: 'button', action: 'files.save' },
			{ type: 'button', action: 'files.saveAs' },
			{ type: 'button', action: 'files.saveAll' },
		])

		this.addDropdown('tools', 'toolbar.tools.name', [{ type: 'button', action: 'editor.clearNotifications' }])

		this.addDropdown('tools', 'toolbar.help.name', [
			{ type: 'button', action: 'help.gettingStarted' },
			{ type: 'button', action: 'help.faq' },
			{ type: 'button', action: 'help.extensions' },
			{ type: 'button', action: 'help.feedback' },
			{ type: 'seperator' },
			{ type: 'button', action: 'help.scriptingDocs' },
			{ type: 'button', action: 'help.bedrockDevDocs' },
			{ type: 'button', action: 'help.creatorDocs' },
			{ type: 'seperator' },
			{ type: 'button', action: 'help.openChangelog' },
			{ type: 'button', action: 'help.releases' },
		])

		this.addButton('help.openDownloadGuide')
	}

	public static addButton(action: string): Button {
		const item: Button = { type: 'button', action }

		this.items.value.push(item)
		this.items.value = [...this.items.value]

		return item
	}

	public static addDropdown(id: string, name: string, items: DropdownItem[]): Dropdown {
		const item: Dropdown = { type: 'dropdown', id, name, items }

		this.items.value.push(item)
		this.items.value = [...this.items.value]

		return item
	}

	public static addDropdownItem(dropdownId: string, item: DropdownItem) {
		const dropdown = this.items.value.find((item) => item.type === 'dropdown' && item.id === dropdownId) as Dropdown | undefined

		if (!dropdown) return

		dropdown.items.push(item)
		this.items.value = [...this.items.value]
	}

	public static removeButton(button: Button) {
		this.items.value.splice(this.items.value.indexOf(button), 1)
		this.items.value = [...this.items.value]
	}

	public static removeDropdown(dropdown: Dropdown) {
		this.items.value.splice(this.items.value.indexOf(dropdown), 1)
		this.items.value = [...this.items.value]
	}

	public static removeDropdownItem(dropdownId: string, item: DropdownItem) {
		const dropdown = this.items.value.find((item) => item.type === 'dropdown' && item.id === dropdownId) as Dropdown | undefined

		if (!dropdown) return

		dropdown.items.splice(dropdown.items.indexOf(item), 1)
		this.items.value = [...this.items.value]
	}
}
