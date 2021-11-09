import { VirtualDirectoryHandle } from './Virtual/DirectoryHandle'
import { VirtualFileHandle } from './Virtual/FileHandle'

/**
 * Chrome 93 and 94 crash when we try to call createWritable on a file handle inside of a web worker
 * We therefore enable this polyfill to work around the bug
 */
function isCrashingChromeBrowser() {
	const unsupportedChromeVersions = ['93', '94']

	// @ts-ignore: TypeScript doesn't know about userAgentData yet
	const userAgentData: any = navigator.userAgentData
	if (!userAgentData) return false

	const chromeBrand = userAgentData.brands.find(
		({ brand }: any) => brand === 'Google Chrome'
	)
	if (!chromeBrand) return false

	return unsupportedChromeVersions.includes(chromeBrand.version)
}

export let isUsingFileSystemPolyfill = false
export let isUsingSaveAsPolyfill = false
export let isUsingOriginPrivateFs = false

if (
	isCrashingChromeBrowser() ||
	typeof window.showDirectoryPicker !== 'function'
) {
	if (typeof navigator.storage.getDirectory === 'function') {
		isUsingOriginPrivateFs = true

		window.showDirectoryPicker = () => navigator.storage.getDirectory()
	} else {
		isUsingFileSystemPolyfill = true

		window.showDirectoryPicker = async () =>
			// @ts-ignore Typescript doesn't like our polyfill
			new VirtualDirectoryHandle(null, 'bridgeFolder', undefined)
	}
}

if (
	isCrashingChromeBrowser() ||
	typeof window.showOpenFilePicker !== 'function'
) {
	// @ts-ignore Typescript doesn't like our polyfill
	window.showOpenFilePicker = async (options: OpenFilePickerOptions) => {
		const opts = { types: [], ...options }

		const input = document.createElement('input')
		input.type = 'file'
		input.multiple = opts.multiple ?? false
		input.accept = opts.types
			.map((e: FilePickerAcceptType) => Object.values(e.accept))
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

					document.body.removeChild(input)
					resolve(
						// @ts-ignore
						await Promise.all(
							files.map(
								async (file) =>
									new VirtualFileHandle(
										null,
										file.name,
										new Uint8Array(
											await file.arrayBuffer()
										),
										true
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
if (
	isCrashingChromeBrowser() ||
	typeof window.showSaveFilePicker !== 'function'
) {
	isUsingSaveAsPolyfill = true

	// @ts-ignore
	window.showSaveFilePicker = async (
		// @ts-ignore
		options?: ISaveFilePickerOptions = {}
	) => {
		return new VirtualFileHandle(
			null,
			options.suggestedName ?? 'newFile.txt',
			new Uint8Array(),
			true
		)
	}
}

if (
	isCrashingChromeBrowser() ||
	(globalThis.DataTransferItem &&
		!DataTransferItem.prototype.getAsFileSystemHandle)
) {
	// @ts-ignore
	DataTransferItem.prototype.getAsFileSystemHandle = async function () {
		if (this.kind === 'file') {
			const file = this.getAsFile()

			if (!file) return null
			return new VirtualFileHandle(
				null,
				file.name,
				new Uint8Array(await file.arrayBuffer()),
				true
			)
		} else if (this.kind === 'directory') {
			return new VirtualDirectoryHandle(null, 'unknown')
		}

		return null
	}
}
