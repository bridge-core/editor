import { data, windows } from '@/App'
import { Ref, ref } from 'vue'
import { ExtensionManifest } from '@/libs/extensions/Extensions'

export class ExtensionLibrary {
	public tags: Record<string, { icon: string; color?: string }> = {}
	public selectedTag: Ref<string> = ref('All')
	public extensions: ExtensionManifest[] = []

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
}
