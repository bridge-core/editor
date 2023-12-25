import { AsyncUnzipInflate, Unzip, UnzipFile } from 'fflate'
import { GenericUnzipper } from './GenericUnzipper'
import { FileSystem } from '../FileSystem'
import { wait } from '/@/utils/wait'
import { invoke } from '@tauri-apps/api/tauri'
import { basename, parse } from '/@/utils/path'

/**
 * Streaming variant of the Unzipper class. It is slightly faster and consumes less memory.
 */
export class StreamingUnzipper extends GenericUnzipper<Uint8Array> {
	/**
	 * Unzip the given data
	 * @param data Data to unzip
	 * @returns Promise<void>
	 */
	async unzip(data: Uint8Array) {
		const fs = new FileSystem(this.directory)

		if (import.meta.env.VITE_IS_TAURI_APP) {
			this.task?.update(0, 200)

			// returns in the form of path --> array of u8s
			const files: { [key: string]: number[] } = await invoke(
				'unzip_command',
				{ data: Array.from(data) }
			)

			this.task?.update(100, 200)

			const paths = Object.keys(files)
			for (let fileIndex = 0; fileIndex < paths.length; fileIndex++) {
				const path = paths[fileIndex]

				// Some zip files seem to also contain folders which we need to check for so that we don't create a file
				if (path.endsWith(basename(path)))
					await fs.writeFile(path, new Uint8Array(files[path]))

				this.task?.update(
					100 + Math.floor((fileIndex / paths.length) * 100),
					200
				)
			}

			this.task?.complete()

			return
		}

		this.task?.update(0, data.length)
		let streamedBytes = 0
		let totalFiles = 0
		let currentFileCount = 0

		const unzipStream = new Promise<void>(async (resolve, reject) => {
			const unzip = new Unzip(async (stream) => {
				totalFiles++

				// Skip directories
				if (!stream.name.endsWith('/')) {
					await this.streamFile(fs, stream).catch((err) =>
						reject(err)
					)
				}

				streamedBytes += stream.size ?? 0
				this.task?.update(streamedBytes)

				currentFileCount++
				// Is this safe to do? There seems to be no better way to detect that the stream is done processing
				if (currentFileCount === totalFiles) {
					this.task?.complete()
					resolve()
				}
			})

			unzip.register(AsyncUnzipInflate)
			unzip.push(data, true)
		})

		await unzipStream

		// For some reason, Chromium doesn't transfer all files upon calling writable.close() at the desired time.
		// This means that some files are imported incorrectly if we don't wait a bit.
		// (Data would still be within .crswap files)
		await wait(100)
	}

	/**
	 * Handle a single streamed file
	 */
	protected async streamFile(fs: FileSystem, stream: UnzipFile) {
		const fileHandle = await fs.getFileHandle(stream.name, true)
		const writable = await fileHandle.createWritable()
		let writeIndex = 0
		const writePromises: Promise<void>[] = []

		const streamedFile = new Promise<void>((resolve, reject) => {
			stream.ondata = (err, chunk, final) => {
				if (err) return reject(err)

				if (chunk) {
					writePromises.push(
						writable.write({
							type: 'write',
							data: chunk,
							position: writeIndex,
						})
					)
					writeIndex += chunk.length
				}

				if (final) {
					resolve()
				}
			}
		})

		stream.start()

		await streamedFile
		await Promise.all(writePromises)
		await writable.close()
	}
}
