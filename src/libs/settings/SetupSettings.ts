import { Settings } from './Settings'

enum JSONEditorOptions {
	TreeEditor = 'Tree Editor',
	RawText = 'Raw Text',
}

export function setupEditorSettings() {
	Settings.addSetting('jsonEditor', {
		default: JSONEditorOptions.TreeEditor,
	})

	Settings.addSetting('formatOnSave', {
		default: true
	})

	Settings.addSetting('keepTabsOpen', {
		default: true,
	})

	Settings.addSetting('autoSaveChanges', {
		default: false,
	})
}
