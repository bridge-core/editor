import { fileSystem, themeManager } from '@/App'
import { join } from '@/libs/path'

export class Extension {
	constructor(public path: string) {}

	public async load() {
		const themesPath = join(this.path, 'themes')
		if (await fileSystem.exists(themesPath)) {
			for (const entry of await fileSystem.readDirectoryEntries(themesPath)) {
				const theme = await fileSystem.readFileJson(entry.path)

				themeManager.addTheme(theme)
			}
		}
	}
}
