import { Event } from '@/libs/event/Event'
import { get, set } from 'idb-keyval'
import { Settings } from '@/libs/settings/Settings'

interface ActionConfig {
	id: string
	trigger: (data?: unknown) => void
	keyBinding?: string
	icon?: string
	name?: string
	description?: string
	requiresContext?: boolean
	visible?: boolean
	category?: string
}

export class Action {
	public static allDisabled: boolean = false

	public id: string
	public keyBinding?: string
	public icon?: string
	public name?: string
	public description?: string
	public requiresContext: boolean
	public category: string

	public visible: boolean = true

	public updated: Event<void> = new Event()

	public trigger: (data?: unknown) => void

	private ctrlModifier: boolean = false
	private shiftModifier: boolean = false
	private altModifier: boolean = false
	private key: string = ''

	public constructor(config: ActionConfig) {
		this.id = config.id
		this.trigger = config.trigger

		Settings.addSetting(`actionKeybind-${this.id}`, {
			default: undefined,
		})

		this.keyBinding = Settings.get(`actionKeybind-${this.id}`) ?? config.keyBinding

		this.icon = config.icon
		this.name = config.name
		this.description = config.description
		this.requiresContext = config.requiresContext ?? false
		this.category = config.category ?? 'actions.misc.name'
		this.visible = config.visible ?? true

		if (this.keyBinding) {
			this.ctrlModifier = this.keyBinding.includes('Ctrl')
			this.shiftModifier = this.keyBinding.includes('Shift')
			this.altModifier = this.keyBinding.includes('Alt')

			this.key = this.keyBinding.split(' + ').filter((key) => key !== 'Ctrl' && key !== 'Shift' && key !== 'Alt')[0]
		}

		window.addEventListener('keydown', (event) => {
			if (Action.allDisabled) return

			if (!this.keyBinding) return

			if (this.ctrlModifier !== event.ctrlKey) return
			if (this.shiftModifier !== event.shiftKey) return
			if (this.altModifier !== event.altKey) return

			if (event.key.toUpperCase() !== this.key && event.key !== this.key) return

			event.preventDefault()

			this.trigger(undefined)
		})
	}

	public static disabledAll() {
		Action.allDisabled = true
	}

	public static enableAll() {
		Action.allDisabled = false
	}

	public setVisible(visible: boolean) {
		if (this.visible === visible) return

		this.visible = visible

		this.updated.dispatch()
	}

	public rebind(key: string, ctrlModifier: boolean, shiftModifier: boolean, altModifier: boolean) {
		this.key = key
		this.ctrlModifier = ctrlModifier
		this.shiftModifier = shiftModifier
		this.altModifier = altModifier

		this.keyBinding = [ctrlModifier ? 'Ctrl' : undefined, altModifier ? 'Alt' : undefined, shiftModifier ? 'Shift' : undefined, key.toUpperCase()]
			.filter((item) => item !== undefined)
			.join(' + ')

		Settings.set(`actionKeybind-${this.id}`, this.keyBinding)

		this.updated.dispatch()
	}

	public unbind() {
		this.keyBinding = undefined

		this.updated.dispatch()
	}
}
