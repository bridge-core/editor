import { zip, Zippable, zipSync } from 'fflate'
import { AnyDirectoryHandle } from '../Types'
import { iterateDirParallel } from '/@/utils/iterateDir'
import { invoke } from '@tauri-apps/api/tauri'

export class ZipDirectory {
	constructor(protected handle: AnyDirectoryHandle) {}

	async package(ignoreFolders?: Set<string>) {
		if (import.meta.env.VITE_IS_TAURI_APP) {
			const files: { [key: string]: number[] } = {}

			await iterateDirParallel(
				this.handle,
				async (fileHandle, filePath) => {
					const file = await fileHandle.getFile()
					files[filePath] = Array.from(
						new Uint8Array(await file.arrayBuffer())
					)
				},
				ignoreFolders
			)

			return invoke('zip_command', { files })
		}

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
