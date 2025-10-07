import { Settings } from './Settings'

export function setupGeneralSettings() {
	Settings.addSetting('restoreTabs', {
		default: true,
	})
}

export function setupEditorSettings() {
	Settings.addSetting('jsonEditor', {
		default: 'text',
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

	Settings.addSetting('showArrayIndices', {
		default: false,
	})
}
