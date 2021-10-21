import { ImageTab } from './ImageTab'
import { AnyFileHandle } from '../../FileSystem/Types'
import TgaLoader from 'tga-js'

export class TargaTab extends ImageTab {
	static is(fileHandle: AnyFileHandle) {
		const fileName = fileHandle.name
		return fileName.endsWith('.tga') || fileName.endsWith('.targa')
	}

	async onActivate() {
		const loader = new TgaLoader()
		const file = await this.fileHandle.getFile()

		loader.load(new Uint8Array(await file.arrayBuffer()))

		this.dataUrl = loader.getDataURL('image/png')
	}

	save() {
		/// TODO: Save `this.dataUrl` value to `${this.fileHandle.name}.png` file
	}

	async saveAs() {
		/// TODO: Save `this.dataUrl` value to user input
	}
}
