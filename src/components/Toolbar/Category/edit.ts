import { App } from '/@/App'
import { ToolbarCategory } from '../ToolbarCategory'

export function setupEditCategory(app: App) {
	const edit = new ToolbarCategory('mdi-pencil-outline', 'toolbar.edit.name')

	edit.addItem(
		app.actionManager.create({
			icon: 'mdi-content-copy',
			name: 'actions.copy.name',
			description: 'actions.copy.description',
			keyBinding: 'Ctrl + C',
			prevent: (element) => {
				return element.tagName === 'INPUT'
			},
			onTrigger: () => app.tabSystem?.selectedTab?.copy(),
		})
	)
	edit.addItem(
		app.actionManager.create({
			icon: 'mdi-content-cut',
			name: 'actions.cut.name',
			description: 'actions.cut.description',
			keyBinding: 'Ctrl + X',
			prevent: (element) => {
				return element.tagName === 'INPUT'
			},
			onTrigger: () => app.tabSystem?.selectedTab?.cut(),
		})
	)
	edit.addItem(
		app.actionManager.create({
			icon: 'mdi-content-paste',
			name: 'actions.paste.name',
			description: 'actions.paste.description',
			keyBinding: 'Ctrl + V',
			prevent: (element) => {
				return element.tagName === 'INPUT'
			},
			onTrigger: () => app.tabSystem?.selectedTab?.paste(),
		})
	)

	App.toolbar.addCategory(edit)
}
