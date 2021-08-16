import { FileTab } from '/@/components/TabSystem/FileTab'
import { loadAsDataURL, loadHandleAsDataURL } from '/@/utils/loadAsDataUrl'
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

	setReadOnly() {
		this.isReadOnly = true
	}

	async onActivate() {
		this.dataUrl = await loadHandleAsDataURL(this.fileHandle)
	}

	get icon() {
		return 'mdi-file-image-outline'
	}
	get iconColor() {
		return 'primary'
	}

	save() {}
}
