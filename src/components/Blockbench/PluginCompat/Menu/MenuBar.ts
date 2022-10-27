import { BlockbenchAction } from '../Actions/Action'
import { App } from '/@/App'
import { ToolbarCategory } from '/@/components/Toolbar/ToolbarCategory'

const defaultBlockbenchMenuCategories = <const>[
	'file',
	'edit',
	'transform',
	'uv',
	'texture',
	'animation',
	'keyframe',
	'display',
	'tools',
	'view',
	'help',
	'filter',
]

let bridgeToolbar: ToolbarCategory | null = null

class BlockbenchCategory {
	static addAction(action: BlockbenchAction) {
		if (!bridgeToolbar) {
			bridgeToolbar = new ToolbarCategory('mdi-cube', 'Blockbench')
			App.toolbar.addCategory(bridgeToolbar)
		}

		const bridgeAction = App.instance.actionManager.create({
			icon: action.options.icon,
			name: action.options.name ? `[${action.options.name}]` : undefined,
			description: action.options.description
				? `[${action.options.description}]`
				: undefined,
			onTrigger: () => action.trigger(new Event('click')),
		})

		const toolbarItem = bridgeToolbar.addItem(bridgeAction)

		return {
			delete: () => {
				toolbarItem.removeItem(bridgeAction)
				bridgeAction.dispose()
			},
		}
	}

	static removeAction(path: string) {}
}

export class MenuBar {
	public static readonly menus = Object.fromEntries(
		defaultBlockbenchMenuCategories.map((id) => [id, BlockbenchCategory])
	)
}
