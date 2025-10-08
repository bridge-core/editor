import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { LocalFileSystem } from '@/libs/fileSystem/LocalFileSystem'
import { Settings } from './Settings'

export function setupGeneralSettings() {
	Settings.addSetting('restoreTabs', {
		default: true,
	})
}

export function setupProjectsSettings() {
	Settings.addSetting('incrementVersionOnExport', {
		default: false || fileSystem instanceof LocalFileSystem,
	})

	Settings.addSetting('addGeneratedWith', {
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
}
