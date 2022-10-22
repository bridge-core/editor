import { FileTab, TReadOnlyMode } from '/@/components/TabSystem/FileTab'
import { loadHandleAsDataURL } from '/@/utils/loadAsDataUrl'
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

	setReadOnly(val: TReadOnlyMode) {
		this.readOnlyMode = val
	}

	async onActivate() {
		this.dataUrl = await loadHandleAsDataURL(this.fileHandle)
	}

	get icon() {
		return 'mdi-file-image-outline'
	}
	get iconColor() {
		return 'resourcePack'
	}

	_save() {}
}
