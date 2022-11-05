import { zip, Zippable, zipSync } from 'fflate'
import { AnyDirectoryHandle } from '../Types'
import { iterateDir, iterateDirParallel } from '/@/utils/iterateDir'

export class ZipDirectory {
	constructor(protected handle: AnyDirectoryHandle) {}

	async package(ignoreFolders?: Set<string>) {
		let directoryContents: Zippable = {}
		await iterateDirParallel(
			this.handle,
			async (fileHandle, filePath) => {
				const file = await fileHandle.getFile()
				directoryContents[filePath] = new Uint8Array(
					await file.arrayBuffer()
				)
			},
			ignoreFolders
		)

		return new Promise<Uint8Array>((resolve, reject) =>
			zip(directoryContents, { level: 6 }, (error, data) => {
				if (error) {
					reject(error)
					return
				}

				resolve(data)
			})
		)
	}
}
