import { Tab } from '@/components/TabSystem/CommonTab'
import { loadAsDataURL } from '@/utils/loadAsDataUrl'
import ImageTabComponent from './ImageTab.vue'

export class ImageTab extends Tab {
	component = ImageTabComponent
	dataUrl?: string = undefined

	static is(filePath: string) {
		return (
			filePath.endsWith('.png') ||
			filePath.endsWith('.jpg') ||
			filePath.endsWith('.jpeg')
		)
	}

	async onActivate() {
		this.dataUrl = await loadAsDataURL(this.path)
	}

	get icon() {
		return 'mdi-file-image-outline'
	}
	get iconColor() {
		return 'primary'
	}

	save() {}
}
