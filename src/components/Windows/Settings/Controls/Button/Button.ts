import { Control, IControl } from '../Control'
import ButtonComponent from './Button.vue'
import Vue from 'vue'

export class Button extends Control<any> {
	constructor(config: {
		name: string
		category: string
		description: string
		onClick: () => void
	}) {
		super(ButtonComponent, { ...config, key: 'N/A' })
	}

	matches(filter: string) {
		return (
			this.config.name.includes(filter) ||
			this.config.description.includes(filter)
		)
	}
	onChange = async () => {}
}
