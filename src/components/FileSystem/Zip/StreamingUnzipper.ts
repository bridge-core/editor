import { AsyncUnzipInflate, Unzip, UnzipFile } from 'fflate'
import { GenericUnzipper } from './GenericUnzipper'
import { FileSystem } from '../FileSystem'
import { wait } from '/@/utils/wait'
import { invoke } from '@tauri-apps/api/tauri'
import { basename, parse } from '/@/utils/path'
import { chunk, last } from 'lodash-es'

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

		const unzipStream = new Promise<void>(async (resolve, reject) => {
			const streams: UnzipFile[] = []

			const unzip = new Unzip(async (stream) => {
				streams.push(stream)
			})

			unzip.register(AsyncUnzipInflate)

			const chunks = this.getChunks(data)
			for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
				unzip.push(chunks[chunkIndex], chunkIndex == chunks.length - 1)
			}

			let streamedBytes = 0

			let streamQueue: { resolved: true; task: Promise<void> }[] = []

			for (const stream of streams) {
				if (stream.name.endsWith('/')) continue

				const queueItem: any = { resolved: false }

				queueItem.task = new Promise<void>(async (res) => {
					await this.streamFile(fs, stream).catch((err) =>
						reject(err)
					)

					queueItem.resolved = true

					res()
				})

				streamQueue.push(queueItem)

				if (streamQueue.length >= 10) {
					await Promise.any(
						streamQueue.map((element) => element.task)
					)

					streamQueue = streamQueue.filter(
						(element) => !element.resolved
					)
				}

				streamedBytes += stream.size ?? 0
				this.task?.update(streamedBytes)
			}

			this.task?.complete()
			resolve()
		})

		await unzipStream

		// For some reason, Chromium doesn't transfer all files upon calling writable.close() at the desired time.
		// This means that some files are imported incorrectly if we don't wait a bit.
		// (Data would still be within .crswap files)
		await wait(100)
	}

	protected getChunks(data: Uint8Array): Uint8Array[] {
		const chunks: Uint8Array[] = []

		const chunkSize = 64 * 1000 // 64kb

		for (
			let startByte = 0;
			startByte < data.length;
			startByte += chunkSize
		) {
			chunks.push(
				data.slice(
					startByte,
					Math.min(data.length, startByte + chunkSize)
				)
			)
		}

		return chunks
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
