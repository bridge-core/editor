import { FileSystem } from './FileSystem'
import { isUsingFileSystemPolyfill } from './Polyfill'
import { basename } from '/@/utils/path'

export async function saveOrDownload(
	filePath: string,
	fileData: Uint8Array,
	fileSystem: FileSystem
) {
	if (isUsingFileSystemPolyfill) {
		download(basename(filePath), fileData)
	} else {
		await fileSystem.writeFile(filePath, fileData)
	}
}

export function download(fileName: string, fileData: Uint8Array) {
	const url = URL.createObjectURL(new Blob([fileData]))
	const a = document.createElement('a')
	a.download = fileName
	a.href = url
	a.click()

	URL.revokeObjectURL(url)
}
