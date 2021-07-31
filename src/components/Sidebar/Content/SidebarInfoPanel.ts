interface IPanelOptions {
	type: 'info' | 'warning' | 'error'
	text: string
	isDismissible?: boolean
}

export class SidebarInfoPanel {
	protected type: 'info' | 'warning' | 'error'
	protected text: string
	protected isDismissible: boolean

	constructor({ type, text, isDismissible }: IPanelOptions) {
		this.type = type
		this.text = text
		this.isDismissible = isDismissible ?? false
	}
}
