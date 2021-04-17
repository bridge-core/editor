import { App } from '/@/App'
import { BrowserUnsupportedWindow } from './BrowserUnsupported/BrowserUnsupported'
import { ExtensionStoreWindow } from './ExtensionStore/ExtensionStore'
import { LoadingWindow } from './LoadingWindow/LoadingWindow'
import { CreatePresetWindow } from './Project/CreatePreset/PresetWindow'
import { CreateProjectWindow } from '/@/components/Projects/CreateProject/CreateProject'
import { FilePickerWindow } from './Project/FilePicker/FilePicker'
import { PackExplorerWindow } from './Project/PackExplorer/PackExplorer'
import { ProjectChooserWindow } from '/@/components/Projects/ProjectChooser/ProjectChooser'
import { SettingsWindow } from './Settings/SettingsWindow'
import { ChangelogWindow } from '/@/components/Windows/Changelog/Changelog'
import { DiscordWindow } from './Discord/DiscordWindow'

export class Windows {
	settings: SettingsWindow
	discordWindow = new DiscordWindow()
	projectChooser = new ProjectChooserWindow()
	packExplorer = new PackExplorerWindow()
	createProject = new CreateProjectWindow()
	loadingWindow = new LoadingWindow()
	filePicker = new FilePickerWindow()
	createPreset = new CreatePresetWindow()
	extensionStore = new ExtensionStoreWindow()
	browserUnsupported = new BrowserUnsupportedWindow()
	changelogWindow = new ChangelogWindow()

	constructor(protected app: App) {
		this.settings = new SettingsWindow(app)
	}
}
