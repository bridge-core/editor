import { FileSystem } from './FileSystem'
import { isUsingFileSystemPolyfill } from './Polyfill'
import { basename } from '/@/utils/path'

export async function saveOrDownload(
	filePath: string,
	fileData: Uint8Array,
	fileSystem: FileSystem
) {
	if (isUsingFileSystemPolyfill) {
		const url = URL.createObjectURL(new Blob([fileData]))
		const a = document.createElement('a')
		a.download = basename(filePath)
		a.href = url
		a.click()

		URL.revokeObjectURL(url)
	} else {
		await fileSystem.writeFile(filePath, fileData)
	}
}
