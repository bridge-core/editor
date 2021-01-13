import { ProjectChooserWindow } from './Project/Chooser/ProjectChooser'
import { SettingsWindow } from './Settings/SettingsWindow'

export class Windows {
	settingsWindow = new SettingsWindow()
	projectChooserWindow = new ProjectChooserWindow()
}
