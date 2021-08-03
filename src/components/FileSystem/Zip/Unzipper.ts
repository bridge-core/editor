import { unzip } from 'fflate'
import { basename, dirname } from '/@/utils/path'
import { GenericUnzipper } from './GenericUnzipper'
import { AnyDirectoryHandle } from '../Types'
import { FileSystem } from '../FileSystem'

export class Unzipper extends GenericUnzipper<Uint8Array> {
	unzip(data: Uint8Array) {
		return new Promise<void>(async (resolve, reject) => {
			unzip(data, async (error, zip) => {
				if (error) return reject(error)
				const fs = new FileSystem(this.directory)

				this.task?.update(0, Object.keys(zip).length)

				let currentFileCount = 0
				for (const filePath in zip) {
					const name = basename(filePath)
					if (name.startsWith('.')) {
						this.task?.update(++currentFileCount)
						// @ts-expect-error
						zip[filePath] = undefined
						continue
					}

					if (filePath.endsWith('/')) {
						this.task?.update(++currentFileCount)
						// @ts-expect-error
						zip[filePath] = undefined
						continue
					}

					await this.fileSystem.write(
						await fs.getFileHandle(filePath, true),
						zip[filePath]
					)
					// @ts-expect-error
					zip[filePath] = undefined
					this.task?.update(++currentFileCount)
				}

				this.task?.complete()
				resolve()
			})

			// @ts-expect-error
			data = undefined
		})
	}
}
