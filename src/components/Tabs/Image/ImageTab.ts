import { fileSystem } from '@/App'
import { Component, Ref, ref } from 'vue'
import ImageTabComponent from './ImageTab.vue'
import { FileTab } from '@/components/TabSystem/FileTab'

export class ImageTab extends FileTab {
	public component: Component | null = ImageTabComponent
	public image: Ref<string | null> = ref(null)

	public static canEdit(path: string): boolean {
		return path.endsWith('.png')
	}

	public async setup() {
		this.image.value = await fileSystem.readFileDataUrl(this.path)
	}
}
