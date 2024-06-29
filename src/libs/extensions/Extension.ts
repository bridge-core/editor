import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { join } from 'pathe'
import { dark, light } from '@/libs/theme/DefaultThemes'
import { Theme } from '@/libs/theme/Theme'
import { Snippet, SnippetData } from '@/libs/snippets/Snippet'

export interface ExtensionManifest {
	author: string
	description: string
	icon: string
	id: string
	link: string
	name: string
	tags: string[]
	target: 'v1' | 'v2' | 'both' | 'v2.1'
	version: string
	releaseTimestamp: number
	contributeFiles: Record<string, { path: string; pack: string }>
}

export class Extension {
	public id: string = 'unloaded'

	private manifest: ExtensionManifest | null = null
	public themes: Theme[] = []
	public presets: any = {}
	public snippets: Snippet[] = []

	constructor(public path: string) {}

	public async load() {
		const manifest: ExtensionManifest = await fileSystem.readFileJson(join(this.path, 'manifest.json'))

		this.id = manifest.id
		this.manifest = manifest

		const themesPath = join(this.path, 'themes')
		if (await fileSystem.exists(themesPath)) {
			for (const entry of await fileSystem.readDirectoryEntries(themesPath)) {
				const theme: Theme = await fileSystem.readFileJson(entry.path)

				const base = theme.colorScheme === 'dark' ? dark : light

				if (manifest.target !== 'v2.1') {
					theme.colors.menuAlternate = theme.colors.sidebarNavigation
					theme.colors.accent = base.colors.text
				}

				theme.colors = {
					...base.colors,
					...theme.colors,
				}

				this.themes.push(theme)
			}
		}

		const presetPath = join(this.path, 'presets.json')
		if (await fileSystem.exists(presetPath)) {
			const presets = await fileSystem.readFileJson(presetPath)

			this.presets = Object.fromEntries(
				Object.entries(presets).map(([path, value]) => [join(this.path, path), value])
			)
		}

		const snippetsPath = join(this.path, 'snippets')
		if (await fileSystem.exists(snippetsPath)) {
			for (const entry of await fileSystem.readDirectoryEntries(snippetsPath)) {
				const snippet: SnippetData = await fileSystem.readFileJson(entry.path)

				this.snippets.push(new Snippet(snippet))
			}
		}
	}
}
