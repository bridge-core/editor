import { Settings } from './Settings'

//Move to somehere better.
export enum JSONEditorOptions {
	TreeEditor = 'Tree Editor',
	RawText = 'Raw Text',
}

export function setupEditorSettings() {
	Settings.addSetting('jsonEditor', {
		default: JSONEditorOptions.TreeEditor,
	})

	Settings.addSetting('keepTabsOpen', {
		default: false,
	})

	Settings.addSetting('autoSaveChanges', {
		default: false,
	})
}
