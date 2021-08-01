export interface IPanelOptions {
	type: 'info' | 'warning' | 'error' | 'success'
	text: string
	isDismissible?: boolean
}

export class InfoPanel {
	protected type: 'info' | 'warning' | 'error' | 'success'
	protected text: string
	protected isDismissible: boolean

	constructor({ type, text, isDismissible }: IPanelOptions) {
		this.type = type
		this.text = text
		this.isDismissible = isDismissible ?? false
	}
}
