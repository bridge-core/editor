import { SidebarItem } from '/@/components/Windows/Layout/Sidebar'
import { ExtensionStoreWindow } from './ExtensionStore'

export class ExtensionTag {
	protected icon: string
	protected text: string
	protected color?: string

	constructor(protected parent: ExtensionStoreWindow, tagName: string) {
		this.icon = this.parent.getTagIcon(tagName)
		this.text = tagName
		this.color = this.parent.getTagColor(tagName)
	}

	asSidebarElement() {
		return new SidebarItem({
			id: this.text.toLowerCase(),
			text: this.text,
			color: this.color,
			icon: this.icon,
		})
	}
}
