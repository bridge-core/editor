import { FileTab, TReadOnlyMode } from '/@/components/TabSystem/FileTab'
import { loadHandleAsDataURL } from '/@/utils/loadAsDataUrl'
import SoundTabComponent from './SoundTab.vue'
import { AnyFileHandle } from '../../FileSystem/Types'

export class SoundTab extends FileTab {
	component = SoundTabComponent
	dataUrl?: string = undefined

	static is(fileHandle: AnyFileHandle) {
		const fileName = fileHandle.name
		return fileName.endsWith('.mp3') || fileName.endsWith('.ogg')
	}

	setReadOnly(val: TReadOnlyMode) {
		this.readOnlyMode = val
	}

	async onActivate() {
		this.dataUrl = await loadHandleAsDataURL(this.fileHandle)
	}

	get icon() {
		return 'mdi-file-music-outline'
	}
	get iconColor() {
		return 'resourcePack'
	}

	_save() {}
}
