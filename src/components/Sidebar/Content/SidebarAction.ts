export interface ISidebarAction {
	id?: string
	icon: string
	name: string
	color?: string

	onTrigger?: (event: MouseEvent) => void
}
export class SidebarAction {
	constructor(protected config: ISidebarAction) {}

	trigger(event: MouseEvent) {
		this.config.onTrigger?.(event)
	}
}
