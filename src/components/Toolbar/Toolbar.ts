import { SettingsWindow } from '@/components/Windows/Settings/SettingsWindow'

export class Toolbar {
	public static items: { name: string; icon: string; action: () => void }[] = []

	public static setup() {
		this.addItem('toolbar.project.name', 'space_dashboard', () => null)
		this.addItem('toolbar.settings.name', 'help', () => SettingsWindow.open())
		this.addItem('toolbar.file.name', 'draft', () => null)
		this.addItem('toolbar.tools.name', 'build', () => null)
		this.addItem('toolbar.help.name', 'help', () => null)
		this.addItem('toolbar.download.name', 'download', () => {
			window.open('https://bridge-core.app/guide/download/')
		})
	}

	public static addItem(name: string, icon: string, action: () => void) {
		this.items.push({ name, icon, action })
	}
}
