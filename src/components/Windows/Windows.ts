import { App } from '/@/App'
import { BrowserUnsupportedWindow } from './BrowserUnsupported/BrowserUnsupported'
import { ExtensionStoreWindow } from './ExtensionStore/ExtensionStore'
import { LoadingWindow } from './LoadingWindow/LoadingWindow'
import { CreatePresetWindow } from './Project/CreatePreset/PresetWindow'
import { CreateProjectWindow } from '/@/components/Projects/CreateProject/CreateProject'
import { ProjectChooserWindow } from '/@/components/Projects/ProjectChooser/ProjectChooser'
import { SettingsWindow } from './Settings/SettingsWindow'
import { ChangelogWindow } from '/@/components/Windows/Changelog/Changelog'
import { SocialsWindow } from './Socials/SocialsWindow'
import { CompilerWindow } from '../Compiler/Window/Window'

export class Windows {
	settings: SettingsWindow
	socialsWindow = new SocialsWindow()
	projectChooser: ProjectChooserWindow
	createProject = new CreateProjectWindow()
	loadingWindow = new LoadingWindow()
	createPreset = new CreatePresetWindow()
	extensionStore = new ExtensionStoreWindow()
	browserUnsupported = new BrowserUnsupportedWindow()
	changelogWindow = new ChangelogWindow()
	compilerWindow = new CompilerWindow()

	constructor(protected app: App) {
		this.settings = new SettingsWindow(app)
		this.projectChooser = new ProjectChooserWindow(app)
	}
}
