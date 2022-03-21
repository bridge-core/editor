import { Control } from '../Control'
import ActionViewerComponent from './ActionViewer.vue'
import { Action } from '/@/components/Actions/Action'
import { shallowReactive } from 'vue'

export class ActionViewer extends Control<any> {
	config: any = shallowReactive({ category: 'actions', action: {} })

	constructor(action: Action) {
		super(
			ActionViewerComponent,
			{
				category: 'actions',
				action: {},
				description: action.description ?? 'No description provided',
				key: action.id,
				name: action.name ?? 'general.unknown',
			},
			undefined
		)
		this.config.action = action
	}

	matches(filter: string) {
		return (
			this.config.action.name.includes(filter) ||
			this.config.action.description.includes(filter)
		)
	}
	onChange = async () => {}
}
