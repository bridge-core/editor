import { ref, markRaw } from 'vue'
import { VirtualDirectoryHandle } from './Virtual/DirectoryHandle'
import { VirtualFileHandle } from './Virtual/FileHandle'
import { IndexedDbStore } from './Virtual/Stores/IndexedDb'

/**
 * Chrome 93 and 94 crash when we try to call createWritable on a file handle inside of a web worker
 * We therefore enable this polyfill to work around the bug
 *
 * Additionally, Brave, Opera and similar browsers do not support the FileSystem API so we enable
 * the polyfill for all browsers which are not Chrome or Edge
 * (Brave and Opera still have the API methods but they're NOOPs so our detection doesn't work)
 */
function isUnsupportedBrowser() {
	const unsupportedChromeVersions = ['93', '94']

	// @ts-ignore: TypeScript doesn't know about userAgentData yet
	const userAgentData: any = navigator.userAgentData
	if (!userAgentData) return true

	const chromeBrand = userAgentData.brands.find(
		({ brand }: any) => brand === 'Google Chrome'
	)
	const edgeBrand = userAgentData.brands.find(
		({ brand }: any) => brand === 'Microsoft Edge'
	)
	const operaBrand = userAgentData.brands.find(
		({ brand }: any) => brand === 'Opera GX' || brand === 'Opera'
	)
	if (chromeBrand)
		return unsupportedChromeVersions.includes(chromeBrand.version)
	if (edgeBrand || operaBrand) return false

	return true
}

export let isUsingFileSystemPolyfill = ref(false)
export let isUsingSaveAsPolyfill = false
export let isUsingOriginPrivateFs = false

if (
	isUnsupportedBrowser() ||
	typeof window.showDirectoryPicker !== 'function'
) {
	// TODO: Enable once safari properly supports file handles (createWritable)
	if (
		false &&
		isUnsupportedBrowser() &&
		typeof navigator.storage.getDirectory === 'function'
	) {
		isUsingOriginPrivateFs = true

		window.showDirectoryPicker = () => navigator.storage.getDirectory()
	} else {
		isUsingFileSystemPolyfill.value = true

		window.showDirectoryPicker = async () =>
			// @ts-ignore Typescript doesn't like our polyfill
			markRaw(
				new VirtualDirectoryHandle(new IndexedDbStore(), 'bridgeFolder')
			)
	}
}

if (isUnsupportedBrowser() || typeof window.showOpenFilePicker !== 'function') {
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

		return new Promise((resolve, reject) => {
			input.addEventListener(
				'change',
				async (event) => {
					const files = [...(input.files ?? [])]

					if (document.body.contains(input))
						document.body.removeChild(input)

					resolve(
						// @ts-ignore
						await Promise.all(
							files.map(async (file) =>
								markRaw(
									new VirtualFileHandle(
										null,
										file.name,
										new Uint8Array(await file.arrayBuffer())
									)
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
					if (input.value.length) return

					reject('User aborted selecting file')

					if (document.body.contains(input))
						document.body.removeChild(input)
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
if (isUnsupportedBrowser() || typeof window.showSaveFilePicker !== 'function') {
	isUsingSaveAsPolyfill = true

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

/**
 * In order to support drag and drop of files on our native Windows build,
 * we need to polyfill the DataTransferItem.getAsFileSystemHandle method
 * to also use a VirtualFileHandle (just like the base file system)
 */
if (
	import.meta.env.VITE_IS_TAURI_APP ||
	isUnsupportedBrowser() ||
	(globalThis.DataTransferItem &&
		!DataTransferItem.prototype.getAsFileSystemHandle)
) {
	// @ts-ignore
	DataTransferItem.prototype.getAsFileSystemHandle = async function () {
		if (this.kind === 'file') {
			const file = this.getAsFile()

			if (!file) return null

			// We need to use this to differentiate between file and folder on Tauri build
			if (import.meta.env.VITE_IS_TAURI_APP) {
				const entry = <FileSystemEntry | null>this.webkitGetAsEntry()

				if (entry !== null && entry.isDirectory) {
					return markRaw(
						createVirtualDirectoryFromFileSystemDirectoryEntry(
							<FileSystemDirectoryEntry>entry,
							null,
							[entry.name]
						)
					)
				}
			}

			return new VirtualFileHandle(
				null,
				file.name,
				new Uint8Array(await file.arrayBuffer())
			)
		} else if (this.kind === 'directory') {
			return markRaw(new VirtualDirectoryHandle(null, 'unknown'))
		}

		return null
	}
}

async function createVirtualDirectoryFromFileSystemDirectoryEntry(
	directoryEntry: FileSystemDirectoryEntry,
	parent: VirtualDirectoryHandle | null,
	path: string[]
): Promise<VirtualDirectoryHandle> {
	const virtualDirectory = new VirtualDirectoryHandle(
		parent,
		directoryEntry.name,
		path,
		true
	)
	await virtualDirectory.setupDone.fired

	const reader = directoryEntry.createReader()

	await new Promise<void>((res) => {
		reader.readEntries(async (results) => {
			for (const entry of results) {
				if (entry.isDirectory) {
					createVirtualDirectoryFromFileSystemDirectoryEntry(
						<FileSystemDirectoryEntry>entry,
						virtualDirectory,
						[...path, entry.name]
					)
				}

				if (entry.isFile) {
					const file = await new Promise<File>((res) => {
						;(<FileSystemFileEntry>entry).file((file) => {
							res(file)
						})
					})

					const virtualFileHandle =
						await virtualDirectory.getFileHandle(entry.name, {
							create: true,
							initialData: new Uint8Array(
								await file.arrayBuffer()
							),
						})

					await virtualFileHandle.setupDone.fired
				}
			}

			res()
		})
	})

	return virtualDirectory
}
