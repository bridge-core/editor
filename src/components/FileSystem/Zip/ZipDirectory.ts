import { Zippable, zipSync } from 'fflate'
import { AnyDirectoryHandle } from '../Types'
import { iterateDir } from '/@/utils/iterateDir'

export class ZipDirectory {
	constructor(protected handle: AnyDirectoryHandle) {}

	async package() {
		let directoryContents: Zippable = {}
		await iterateDir(this.handle, async (fileHandle, filePath) => {
			const file = await fileHandle.getFile()
			directoryContents[filePath] = new Uint8Array(
				await file.arrayBuffer()
			)
		})

		return zipSync(directoryContents)
	}
}
