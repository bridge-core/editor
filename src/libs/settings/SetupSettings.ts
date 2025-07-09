import { Settings } from './Settings'

enum JSONEditorOptions {
	TreeEditor = 'Tree Editor',
	RawText = 'Raw Text',
}

export function setupGeneralSettings() {
	Settings.addSetting('restoreTabs', {
		default: true,
	})
}

export function setupEditorSettings() {
	Settings.addSetting('jsonEditor', {
		default: JSONEditorOptions.TreeEditor,
	})

	Settings.addSetting('formatOnSave', {
		default: true,
	})

	Settings.addSetting('keepTabsOpen', {
		default: false,
	})

	Settings.addSetting('autoSaveChanges', {
		default: false,
	})
}
