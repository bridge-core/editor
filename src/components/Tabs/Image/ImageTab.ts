import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { Component, Ref, ref } from 'vue'
import ImageTabComponent from './ImageTab.vue'
import { FileTab } from '@/components/TabSystem/FileTab'

export class ImageTab extends FileTab {
	public component: Component | null = ImageTabComponent
	public image: Ref<string | null> = ref(null)

	public static canEdit(path: string): boolean {
		return path.endsWith('.png')
	}

	public async create() {
		this.image.value = await fileSystem.readFileDataUrl(this.path)
	}
}
