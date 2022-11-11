import TgaLoader from 'tga-js'
import { ImageTab } from './ImageTab'
import { AnyFileHandle } from '../../FileSystem/Types'
import { SimpleAction } from '../../Actions/SimpleAction'

export class TargaTab extends ImageTab {
	protected tga = new TgaLoader()
	maskIsApplied: boolean = true

	static is(fileHandle: AnyFileHandle) {
		return fileHandle.name.endsWith('.tga')
	}

	async setup() {
		await super.setup()

		this.addAction(
			new SimpleAction({
				icon: 'mdi-image-filter-black-white',
				name: 'actions.tgaMaskToggle.name',
				onTrigger: async () => {
					if (this.maskIsApplied) {
						await this.applyUnmaskedImageUrl()
						this.maskIsApplied = false
						return
					}

					this.applyMaskedImageUrl()
					this.maskIsApplied = true
				},
			})
		)
	}

	async onActivate() {
		this.isLoading = true

		const file = await this.fileHandle.getFile()
		this.tga.load(new Uint8Array(await file.arrayBuffer()))

		this.isLoading = false

		if (this.maskIsApplied) {
			this.applyMaskedImageUrl()
			return
		}

		await this.applyUnmaskedImageUrl()
	}

	_save() {
		/// TODO: Save `this.dataUrl` value to `${this.fileHandle.name}.png` file
	}

	async saveAs() {
		/// TODO: Save `this.dataUrl` value to user input
	}

	applyMaskedImageUrl() {
		this.dataUrl = this.tga.getDataURL('image/png')
	}

	async applyUnmaskedImageUrl() {
		/// Get ImageData from TGALoader
		const { width, height, data } = this.tga.getImageData()

		// @ts-ignore OffscreenCanvas API types not available in TypeScript
		const offscreen = new OffscreenCanvas(width, height)

		/// Create context to contain new image
		const ctx = offscreen.getContext('2d')
		const imageData = ctx.createImageData(width, height)

		/// Rewrite ImageData
		/// Copies RGB channels from original data
		/// Clamps alpha channel to be fully opaque (white)
		const len = data.length

		for (let itr = 0; itr < len; itr += 4) {
			imageData.data[itr] = data[itr]
			imageData.data[itr + 1] = data[itr + 1]
			imageData.data[itr + 2] = data[itr + 2]
			imageData.data[itr + 3] = 255
		}

		ctx.putImageData(imageData, 0, 0)

		const canvasBlob = await offscreen.convertToBlob({
			type: 'image/png',
		})

		/// Convert OffscreenCanvas content to Blob, so it can be converted to base64
		const reader = new FileReader()
		reader.readAsDataURL(canvasBlob)

		reader.onload = () => {
			this.dataUrl = reader.result?.toString()
		}

		reader.onerror = () => {
			throw new Error('Failed reading OffscreenCanvas Blob')
		}
	}
}
