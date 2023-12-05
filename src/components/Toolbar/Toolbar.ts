export class Toolbar {
	public items: { name: string; icon: string; action: () => void }[] = []

	constructor() {
		this.addItem('toolbar.project.name', 'space_dashboard', () => null)
		// this.addItem('toolbar.settings.name', 'help', () =>
		// 	App.instance.windows.open('settings')
		// )
		this.addItem('toolbar.file.name', 'draft', () => null)
		this.addItem('toolbar.tools.name', 'build', () => null)
		this.addItem('toolbar.help.name', 'help', () => null)
		this.addItem('toolbar.download.name', 'download', () => {
			window.open('https://bridge-core.app/guide/download/')
		})
	}

	public addItem(name: string, icon: string, action: () => void) {
		this.items.push({ name, icon, action })
	}
}
