export interface ISidebarAction {
	id?: string
	icon: string
	name: string
	color?: string

	onTrigger?: (event: MouseEvent) => void
}
export class SidebarAction {
	constructor(protected config: ISidebarAction) {}

	getConfig() {
		return this.config
	}

	trigger(event: MouseEvent) {
		this.config.onTrigger?.(event)
	}
}
