import { App } from '/@/App'

export class Toolbar {
	public items: { name: string; icon: string; action: () => void }[] = []

	constructor() {
		this.addItem('Project', 'space_dashboard', () => null)
		this.addItem('Settings', 'help', () =>
			App.instance.windows.open('settings')
		)
		this.addItem('File', 'draft', () => null)
		this.addItem('Tools', 'build', () => null)
		this.addItem('Help', 'help', () => null)
		this.addItem('Download', 'download', () => null)
	}

	public addItem(name: string, icon: string, action: () => void) {
		this.items.push({ name, icon, action })
	}
}
