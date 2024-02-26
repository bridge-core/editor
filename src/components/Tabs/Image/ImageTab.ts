import { fileSystem } from '@/App'
import { Tab } from '@/components/TabSystem/Tab'
import { Component, Ref, ref } from 'vue'
import ImageTabComponent from './ImageTab.vue'

export class ImageTab extends Tab {
	public component: Component | null = ImageTabComponent
	public image: Ref<string | null> = ref(null)

	public static canEdit(path: string): boolean {
		return path.endsWith('.png')
	}

	public async setup() {
		this.image.value = await fileSystem.readFileDataUrl(this.path)
	}
}
