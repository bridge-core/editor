import { data, fileSystem, windows } from '@/App'
import { join } from '@/libs/path'
import { Ref, ref } from 'vue'

export interface ExtensionLibraryEntry {
	author: string
	description: string
	icon: string
	id: string
	link: string
	name: string
	tags: string[]
	target: string
	version: string
	releaseTimestamp: number
}

export class ExtensionLibrary {
	public tags: Record<string, { icon: string; color?: string }> = {}
	public selectedTag: Ref<string> = ref('All')
	public extensions: ExtensionLibraryEntry[] = []

	public async load() {
		this.tags = await data.get('packages/common/extensionTags.json')

		this.selectedTag.value = Object.keys(this.tags)[0]

		this.extensions = await (
			await fetch('https://raw.githubusercontent.com/bridge-core/plugins/master/extensions.json')
		).json()

		console.log(this.extensions)
	}

	public async open() {
		await this.load()

		windows.open('extensionLibrary')
	}

	public async download(extension: ExtensionLibraryEntry) {
		const arrayBuffer = await (
			await fetch('https://raw.githubusercontent.com/bridge-core/plugins/master' + extension.link)
		).arrayBuffer()

		await fileSystem.writeFile(join('/extensions', extension.name.replace(/\s+/g, '') + '.zip'), arrayBuffer)
	}
}
