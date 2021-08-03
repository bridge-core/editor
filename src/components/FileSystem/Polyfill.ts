import { VirtualDirectoryHandle } from './Virtual/DirectoryHandle'
import { VirtualFileHandle } from './Virtual/FileHandle'

export let isUsingFileSystemPolyfill = false

if (typeof window.showDirectoryPicker !== 'function') {
	isUsingFileSystemPolyfill = true

	window.showDirectoryPicker = async () =>
		// @ts-ignore Typescript doesn't like our polyfill
		new VirtualDirectoryHandle()
}

if (typeof window.showOpenFilePicker !== 'function') {
	// @ts-ignore Typescript doesn't like our polyfill
	window.showOpenFilePicker = async (options: OpenFilePickerOptions) => {
		const opts = { types: [], ...options }

		const input = document.createElement('input')
		input.type = 'file'
		input.multiple = opts.multiple ?? false
		input.accept = opts.types
			.map((e) => Object.values(e.accept))
			.flat(2)
			.join(',')
		input.style.display = 'none'
		document.body.appendChild(input)

		let isLocked = false
		return new Promise((resolve, reject) => {
			input.addEventListener(
				'change',
				async (event) => {
					isLocked = true
					const files = [...(input.files ?? [])]
					console.log('HERE')

					document.body.removeChild(input)
					resolve(
						// @ts-ignore
						await Promise.all(
							files.map(
								async (file) =>
									new VirtualFileHandle(
										null,
										file.name,
										new Uint8Array(await file.arrayBuffer())
									)
							)
						)
					)
				},
				{ once: true }
			)
			window.addEventListener(
				'focus',
				() => {
					setTimeout(() => {
						if (isLocked) return

						reject('User aborted selecting file')
						document.body.removeChild(input)
					}, 300)
				},
				{ once: true }
			)

			input.click()
		})
	}
}

export interface ISaveFilePickerOptions {
	suggestedName?: string
}
if (typeof window.showSaveFilePicker !== 'function') {
	// @ts-ignore
	window.showSaveFilePicker = async (
		// @ts-ignore
		options?: ISaveFilePickerOptions = {}
	) => {
		return new VirtualFileHandle(
			null,
			options.suggestedName ?? 'newFile.txt',
			new Uint8Array()
		)
	}
}

if (
	globalThis.DataTransferItem &&
	!DataTransferItem.prototype.getAsFileSystemHandle
) {
	// @ts-ignore
	DataTransferItem.prototype.getAsFileSystemHandle = async function () {
		if (this.kind === 'file') {
			const file = this.getAsFile()

			if (!file) return null
			return new VirtualFileHandle(
				null,
				file.name,
				new Uint8Array(await file.arrayBuffer())
			)
		} else if (this.kind === 'directory') {
			return new VirtualDirectoryHandle(null, 'unknown')
		}

		return null
	}
}
