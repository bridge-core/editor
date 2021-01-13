import { PackExplorerWindow } from './Project/PackExplorer/PackExplorer'
import { ProjectChooserWindow } from './Project/ProjectChooser/ProjectChooser'
import { SettingsWindow } from './Settings/SettingsWindow'

export class Windows {
	settings = new SettingsWindow()
	projectChooser = new ProjectChooserWindow()
	packExplorer = new PackExplorerWindow()
}
