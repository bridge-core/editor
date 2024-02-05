import { fileSystem, themeManager } from '@/App'
import { join } from '@/libs/path'
import { dark } from '@/libs/theme/DefaultThemes'

export class Extension {
	constructor(public path: string) {}

	public async load() {
		const themesPath = join(this.path, 'themes')
		if (await fileSystem.exists(themesPath)) {
			for (const entry of await fileSystem.readDirectoryEntries(themesPath)) {
				const theme = await fileSystem.readFileJson(entry.path)

				theme.colors.menuAlternate = theme.colors.sidebarNavigation

				theme.colors = {
					...dark.colors,
					...theme.colors,
				}

				themeManager.addTheme(theme)

				break
			}

			themeManager.reloadTheme()
		}
	}
}
