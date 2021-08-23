import { App } from '/@/App'
import { ToolbarCategory } from '../ToolbarCategory'
import { FileTab } from '/@/components/TabSystem/FileTab'
import { Divider } from '../Divider'
import { TreeTab } from '../../Editors/TreeEditor/Tab'

const blockActions = new Set<string>(['INPUT', 'TEXTAREA'])

export function setupEditCategory(app: App) {
	const edit = new ToolbarCategory('mdi-pencil-outline', 'toolbar.edit.name')

	edit.addItem(
		app.actionManager.create({
			icon: 'mdi-undo',
			name: 'actions.undo.name',
			description: 'actions.undo.description',
			keyBinding: 'Ctrl + Z',
			prevent: (el) =>
				el.tagName === 'INPUT' || el.tagName === 'TEXTAREA',
			onTrigger: () => {
				const currentTab = app.tabSystem?.selectedTab

				if (currentTab instanceof TreeTab) currentTab.treeEditor.undo()
				else document.execCommand('undo')
			},
		})
	)
	edit.addItem(
		app.actionManager.create({
			icon: 'mdi-redo',
			name: 'actions.redo.name',
			description: 'actions.redo.description',
			keyBinding: 'Ctrl + Y',
			prevent: (el) =>
				el.tagName === 'INPUT' || el.tagName === 'TEXTAREA',
			onTrigger: () => {
				const currentTab = app.tabSystem?.selectedTab

				if (currentTab instanceof TreeTab) currentTab.treeEditor.redo()
				else document.execCommand('redo')
			},
		})
	)
	edit.addItem(new Divider())

	edit.addItem(
		app.actionManager.create({
			icon: 'mdi-content-copy',
			name: 'actions.copy.name',
			description: 'actions.copy.description',
			keyBinding: 'Ctrl + C',
			prevent: (element) => {
				return (
					(<HTMLInputElement>element)?.value !== '' &&
					blockActions.has(element.tagName)
				)
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
				return (
					(<HTMLInputElement>element)?.value !== '' &&
					blockActions.has(element.tagName)
				)
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
				return (
					(<HTMLInputElement>element)?.value !== '' &&
					blockActions.has(element.tagName)
				)
			},
			onTrigger: () => app.tabSystem?.selectedTab?.paste(),
		})
	)

	edit.addItem(new Divider())

	edit.addItem(
		app.actionManager.create({
			icon: 'mdi-pencil-outline',
			name: 'actions.toggleReadOnly.name',
			description: 'actions.toggleReadOnly.description',
			onTrigger: () => {
				const currentTab = app.tabSystem?.selectedTab
				if (!(currentTab instanceof FileTab)) return

				currentTab.setReadOnly(!currentTab.isReadOnly)
			},
		})
	)

	App.toolbar.addCategory(edit)
}
