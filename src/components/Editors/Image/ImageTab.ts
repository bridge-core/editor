import { Tab } from '/@/components/TabSystem/CommonTab'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'
import ImageTabComponent from './ImageTab.vue'

export class ImageTab extends Tab<unknown> {
	component = ImageTabComponent
	dataUrl?: string = undefined

	static is(fileHandle: FileSystemFileHandle) {
		const fileName = fileHandle.name
		return (
			fileName.endsWith('.png') ||
			fileName.endsWith('.jpg') ||
			fileName.endsWith('.jpeg')
		)
	}

	async onActivate() {
		this.dataUrl = await loadAsDataURL(this.getPath())
	}

	get icon() {
		return 'mdi-file-image-outline'
	}
	get iconColor() {
		return 'primary'
	}

	save() {}
}
