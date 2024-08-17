/**
 * @description Interface to define an action's configuration.
 */
interface ActionConfig {
	/**
	 * @description The id of the action.
	 */
	id: string
	/**
	 * @description The callback to execute when the action is triggered.
	 * @param data The data passed into the callback when the action is triggered.
	 */
	trigger: (data?: unknown) => void
	/**
	 * @description The keybind/shortcut set for the action.
	 */
	keyBinding?: string
	/**
	 * @description The icon to display for the action.
	 */
	icon?: string
	/**
	 * @description The name to display for the action.
	 */
	name?: string
	/**
	 * @description The description to display for the action.
	 */
	description?: string
}

/**
 * @description Defines an action.
 */
export class Action {
	/**
	 * @description The id of the action.
	 */
	public id: string
	/**
	 * @description The keybind/shortcut to set for the action.
	 */
	public keyBinding?: string
	/**
	 * @description The icon to display for the action.
	 */
	public icon?: string
	/**
	 * @description The name to display for the action.
	 */
	public name?: string
	/**
	 * @description The description to display for the action.
	 */
	public description?: string

	/**
	 * @description Triggers the action.
	 * @param data The data to pass into when triggered.
	 */
	public trigger: (data?: unknown) => void

	/**
	 * @description Creates a new action.
	 * @param config The configuration for the action.
	 */
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

			if (event.key.toUpperCase() !== key && event.key !== key) return

			event.preventDefault()

			this.trigger(undefined)
		})
	}
}
