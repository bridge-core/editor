interface ActionConfig {
	id: string
	trigger: () => void
	keyBinding?: string
}

export class Action {
	public id: string
	public keyBinding?: string
	public trigger: () => void

	constructor(config: ActionConfig) {
		this.id = config.id
		this.trigger = config.trigger
		this.keyBinding = config.keyBinding
	}
}
