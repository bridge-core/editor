import { fileSystem } from '@/App'
import { join } from '@/libs/path'
import { dark } from '@/libs/theme/DefaultThemes'
import { ThemeManager } from '@/libs/theme/ThemeManager'

export class Extension {
	public id: string = 'unloaded'

	constructor(public path: string) {}

	public async load() {
		const manifest = await fileSystem.readFileJson(join(this.path, 'manifest.json'))

		this.id = manifest.id

		const themesPath = join(this.path, 'themes')
		if (await fileSystem.exists(themesPath)) {
			for (const entry of await fileSystem.readDirectoryEntries(themesPath)) {
				const theme = await fileSystem.readFileJson(entry.path)

				theme.colors.menuAlternate = theme.colors.sidebarNavigation

				theme.colors = {
					...dark.colors,
					...theme.colors,
				}

				ThemeManager.addTheme(theme)

				break
			}

			ThemeManager.reloadTheme()
		}
	}
}
