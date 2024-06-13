export interface ActionDisplayConfig {
	label: string
	icon: string
	onClick: () => void
	description?: string
}

export class ActionDisplay {
	public label: string
	public icon: string
	public description?: string
	public onClick: () => void

	constructor(config: ActionDisplayConfig) {
		this.label = config.label
		this.icon = config.icon
		this.description = config.description
		this.onClick = config.onClick
	}
}
