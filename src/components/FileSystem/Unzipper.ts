import { unzip } from 'fflate'
import { basename, dirname } from '/@/utils/path'
import { GenericUnzipper } from './GenericUnzipper'

export class Unzipper extends GenericUnzipper<Uint8Array> {
	unzip(data: Uint8Array) {
		return new Promise<void>(async (resolve, reject) => {
			unzip(data, async (error, zip) => {
				if (error) return reject(error)

				const handles: Record<string, FileSystemDirectoryHandle> = {
					'.': this.directory,
				}

				this.task?.update(0, Object.keys(zip).length)

				let currentFileCount = 0
				for (const filePath in zip) {
					const name = basename(filePath)
					if (name.startsWith('.')) {
						this.task?.update(++currentFileCount)
						delete zip[filePath]
						continue
					}

					const parentDir = dirname(filePath)

					if (filePath.endsWith('/')) {
						handles[filePath.slice(0, -1)] = await handles[
							parentDir
						].getDirectoryHandle(name, {
							create: true,
						})

						this.task?.update(++currentFileCount)
						delete zip[filePath]
						continue
					}

					await this.fileSystem.write(
						await handles[parentDir].getFileHandle(name, {
							create: true,
						}),
						zip[filePath]
					)
					delete zip[filePath]
					this.task?.update(++currentFileCount)
				}

				this.task?.complete()
				resolve()
			})
		})
	}
}
