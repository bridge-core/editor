import { AppMenu } from '../create'
// import TabSystem from '../../../TabSystem'
// import EventBus from '../../../EventBus'
// import NodeShortcuts from '../../../editor/NodeShortcuts'

export const EditMenu: AppMenu = {
	displayName: 'toolbar.edit.name',
	displayIcon: 'mdi-pen',
	elements: [
		{
			displayName: 'toolbar.edit.selection.name',
			displayIcon: 'mdi-select',
			elements: [
				{
					displayName: 'toolbar.edit.selection.unselect',
					displayIcon: 'mdi-cancel',
					keyBinding: {
						key: 'escape',
					},
					onClick: () => {
						// TabSystem.setCurrentFileNav('global')
					},
				},
				{
					displayName: 'toolbar.edit.selection.selectParent',
					displayIcon: 'mdi-chevron-double-up',
					keyBinding: {
						key: 'p',
						ctrlKey: true,
					},
					onClick: () => {
						// try {
						// 	let p = TabSystem.getCurrentNavObj().parent
						// 	if (p !== undefined)
						// 		TabSystem.setCurrentFileNav(p.path)
						// } catch {}
					},
				},
				{
					displayName: 'toolbar.edit.selection.selectNext',
					displayIcon: 'mdi-chevron-down',
					keyBinding: {
						key: 'd',
						ctrlKey: true,
					},
					onClick: () => {
						// TabSystem.moveSelectionDown()
					},
				},
				{
					displayName: 'toolbar.edit.selection.selectPrevious',
					displayIcon: 'mdi-chevron-up',
					keyBinding: {
						key: 'e',
						ctrlKey: true,
					},
					onClick: () => {
						// TabSystem.moveSelectionUp()
					},
				},
			],
		},
		{
			displayName: 'toolbar.edit.jsonNodes.name',
			displayIcon: 'mdi-file-tree',
			elements: [
				{
					displayName: 'toolbar.edit.jsonNodes.toggleOpen',
					displayIcon: 'mdi-lock-open',
					keyBinding: {
						key: 'enter',
						ctrlKey: true,
					},
					onClick: () => {
						// TabSystem.toggleCurrentNode()
					},
				},
				{
					displayName: 'toolbar.edit.jsonNodes.toggleOpenChildren',
					displayIcon: 'mdi-lock-open-variant',
					keyBinding: {
						key: 'p',
						shiftKey: true,
						ctrlKey: true,
					},
					onClick: () => {
						// TabSystem.getCurrentNavObj().toggleOpenDeep()
					},
				},
				{
					displayName: 'toolbar.edit.jsonNodes.moveDown',
					displayIcon: 'mdi-chevron-down',
					keyBinding: {
						key: 'e',
						shiftKey: true,
						ctrlKey: true,
					},
					onClick: () => {
						// TabSystem.moveCurrentDown()
					},
				},
				{
					displayName: 'toolbar.edit.jsonNodes.moveUp',
					displayIcon: 'mdi-chevron-up',
					keyBinding: {
						key: 'd',
						shiftKey: true,
						ctrlKey: true,
					},
					onClick: () => {
						// TabSystem.moveCurrentUp()
					},
				},
				{
					displayName: 'toolbar.edit.jsonNodes.commentUncomment',
					displayIcon: 'mdi-cancel',
					keyBinding: {
						key: 'i',
						ctrlKey: true,
					},
					onClick: () => {
						// try {
						// 	TabSystem.getCurrentNavObj().toggleIsActive()
						// 	TabSystem.setCurrentUnsaved()
						// } catch {}
					},
				},
			],
		},
		{
			displayName: 'toolbar.edit.delete',
			displayIcon: 'mdi-delete',
			keyBinding: {
				key: 'backspace',
				ctrlKey: true,
				prevent: e =>
					e.tagName === 'INPUT' &&
					(e as HTMLInputElement).value !== '',
			},
			onClick: () => {
				// TabSystem.deleteCurrent()
			},
		},
		{
			isHidden: true,
			displayName: 'Delete',
			keyBinding: {
				key: 'delete',
				ctrlKey: true,
				prevent: e =>
					e.tagName === 'INPUT' &&
					(e as HTMLInputElement).value !== '',
			},
			onClick: () => {
				// TabSystem.deleteCurrent()
			},
		},
		{
			displayName: 'toolbar.edit.undo',
			displayIcon: 'mdi-undo',
			keyBinding: {
				key: 'z',
				ctrlKey: true,
			},
			onClick: () => {
				// if (!TabSystem.getHistory()?.undo()) EventBus.trigger('cmUndo')
			},
		},
		{
			displayName: 'toolbar.edit.redo',
			displayIcon: 'mdi-redo',
			keyBinding: {
				key: 'y',
				ctrlKey: true,
			},
			onClick: () => {
				// if (!TabSystem.getHistory()?.redo()) EventBus.trigger('cmRedo')
			},
		},

		{
			displayName: 'toolbar.edit.copy',
			displayIcon: 'mdi-content-copy',
			keyBinding: {
				key: 'c',
				ctrlKey: true,
			},
			onClick: () => {
				// if (
				// 	document.activeElement.tagName === 'BODY' ||
				// 	window.getSelection().toString() == ''
				// ) {
				// 	NodeShortcuts.copy()
				// } else {
				// 	document.execCommand('copy')
				// }
			},
		},
		{
			displayName: 'toolbar.edit.cut',
			displayIcon: 'mdi-content-cut',
			keyBinding: {
				key: 'x',
				ctrlKey: true,
			},
			onClick: () => {
				// if (
				// 	document.activeElement.tagName === 'BODY' ||
				// 	window.getSelection().toString() == ''
				// ) {
				// 	NodeShortcuts.cut()
				// } else {
				// 	document.execCommand('cut')
				// }
			},
		},
		{
			displayName: 'toolbar.edit.paste',
			displayIcon: 'mdi-content-paste',
			keyBinding: {
				key: 'v',
				ctrlKey: true,
			},
			onClick: () => {
				// if (!NodeShortcuts.execPaste()) {
				// 	document.execCommand('paste')
				// }
			},
		},
		{
			displayName: 'toolbar.edit.alternativePaste',
			displayIcon: 'mdi-content-paste',
			keyBinding: {
				key: 'v',
				shiftKey: true,
				ctrlKey: true,
			},
			onClick: () => {
				// if (!NodeShortcuts.execPaste(true)) {
				// 	document.execCommand('paste')
				// }
			},
		},
	],
}
