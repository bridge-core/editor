import { ActionManager } from '@/libs/actions/ActionManager'
import { ActionDisplay, ActionDisplayConfig } from './ActionDisplay'

export class ActionsDisplay {
	public static actions: Record<string, ActionDisplay> = {}

	public static setup() {
		this.addAction('viewDocumentation', <ActionDisplayConfig>{
			label: 'View Documentation',
			icon: 'menu_book',
			description: 'Opens Bridge Documentation.',
			onClick: () => {
				ActionManager.trigger('viewDocumentation') //THIS IS PROBABLY BAD!
			},
		})
	}

	public static addAction(id: string, config: ActionDisplayConfig) {
		const action = new ActionDisplay({
			label: config.label,
			icon: config.icon,
			onClick: config.onClick,
			description: config.description,
		})

		this.actions[id] = action
	}
}
