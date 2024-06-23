interface ActionConfig {
	id: string
	trigger: (data?: unknown) => void
	keyBinding?: string
	icon?: string
	name?: string
	description?: string
}

export class Action {
	public id: string
	public keyBinding?: string
	public icon?: string
	public name?: string
	public description?: string

	public trigger: (data?: unknown) => void

	constructor(config: ActionConfig) {
		this.id = config.id
		this.trigger = config.trigger
		this.keyBinding = config.keyBinding

		this.icon = config.icon
		this.name = config.name
		this.description = config.description

		if (!this.keyBinding) return

		const ctrlModifier = this.keyBinding.includes('Ctrl')
		const shiftModifier = this.keyBinding.includes('Shift')

		const key = this.keyBinding.split(' + ').filter((key) => key !== 'Ctrl' && key !== 'Shift')[0]

		if (!key) return

		window.addEventListener('keydown', (event) => {
			if (ctrlModifier !== event.ctrlKey) return
			if (shiftModifier !== event.shiftKey) return

			if (event.key.toUpperCase() !== key) return

			event.preventDefault()

			this.trigger(undefined)
		})
	}
}
