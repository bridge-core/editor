import { FileTab } from '/@/components/TabSystem/FileTab'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'
import ImageTabComponent from './ImageTab.vue'
import { AnyFileHandle } from '../../FileSystem/Types'

export class ImageTab extends FileTab {
	component = ImageTabComponent
	dataUrl?: string = undefined

	static is(fileHandle: AnyFileHandle) {
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
