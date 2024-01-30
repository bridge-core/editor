import { data, windows } from '@/App'
import { Ref, ref } from 'vue'

export class ExtensionLibrary {
	public tags: Record<string, { icon: string; color?: string }> = {}
	public selectedTag: Ref<string> = ref('none')

	public async load() {
		this.tags = await data.get('packages/common/extensionTags.json')

		this.selectedTag.value = Object.keys(this.tags)[0]
	}

	public async open() {
		await this.load()

		windows.open('extensionLibrary')
	}
}
