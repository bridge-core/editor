import { Control } from '../Control'
import ActionViewerComponent from './ActionViewer.vue'
import { shallowReactive } from 'vue'
import { SimpleAction } from '/@/components/Actions/SimpleAction'

export class ActionViewer extends Control<any> {
	config: any = shallowReactive({ category: 'actions', action: {} })

	constructor(action: SimpleAction, category = 'actions') {
		super(
			ActionViewerComponent,
			{
				category,
				action: {},
				description: action.description ?? 'No description provided',
				key: action.id,
				name: action.name ?? 'general.unknown',
			},
			undefined
		)
		this.config.category = category
		this.config.action = action
	}

	matches(filter: string) {
		return (
			this.config.action.name.includes(filter) ||
			this.config.action.description?.includes(filter)
		)
	}
	onChange = async () => {}
}
