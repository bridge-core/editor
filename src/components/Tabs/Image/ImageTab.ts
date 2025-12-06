import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { Component, Ref, ref } from 'vue'
import ImageTabComponent from './ImageTab.vue'
import { FileTab } from '@/components/TabSystem/FileTab'
import { disposeAll, Disposable } from '@/libs/disposeable/Disposeable'
import { TabManager } from '@/components/TabSystem/TabManager'

export class ImageTab extends FileTab {
	public component: Component | null = ImageTabComponent
	public image: Ref<string | null> = ref(null)
	public canSave: boolean = false

	private disposables: Disposable[] = []

	public static canEdit(path: string): boolean {
		return path.endsWith('.png')
	}

	public async create() {
		this.image.value = await fileSystem.readFileDataUrl(this.path)

		this.disposables.push(
			fileSystem.pathUpdated.on(async (path) => {
				if (!path) return
				if (path !== this.path) return

				if (!(await fileSystem.exists(path))) {
					await TabManager.removeTab(this)
				} else if (!this.modified.value) {
					this.image.value = await fileSystem.readFileDataUrl(this.path)
				}
			})
		)
	}

	public async destroy() {
		disposeAll(this.disposables)
	}
}
