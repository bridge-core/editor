import { Unzip, AsyncUnzipInflate, UnzipFile } from 'fflate'
import { GenericUnzipper } from './GenericUnzipper'
import { App } from '/@/App'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { basename, dirname, join } from '/@/utils/path'

export class StreamingUnzipper extends GenericUnzipper<
	ReadableStream<Uint8Array>
> {
	unzip(stream: ReadableStream<Uint8Array>) {
		return new Promise<void>(async (resolve, reject) => {
			if (!this.task) {
				const app = await App.getApp()
				this.createTask(app.taskManager)
			}

			const fileSystem = new FileSystem(this.directory)
			const unzipper = new Unzip()

			unzipper.register(AsyncUnzipInflate)

			let currentFileCount = 0
			let totalFileCount = 0

			unzipper.onfile = async (file) => {
				const name = basename(file.name)
				const parentDirName = dirname(file.name)

				if (name.startsWith('.') || file.name.endsWith('/')) {
					return
				}
				this.task?.update(undefined, ++totalFileCount)

				const fileHandle = await fileSystem.getFileHandle(
					join(parentDirName, name),
					true
				)
				const writable = await fileHandle.createWritable()

				const data = await this.readFile(file)
				for (const d of data) await writable.write(d)
				await writable.close()

				this.task?.update(++currentFileCount)
				if (currentFileCount === totalFileCount) {
					this.task?.complete()
					resolve()
				}
			}

			const reader = stream.getReader()

			let done = false
			while (!done) {
				const result = await reader.read()
				done = result.done

				if (!done) {
					unzipper.push(result.value!, done)
				}
			}

			reader.cancel()
		})
	}

	protected readFile(file: UnzipFile) {
		return new Promise<Uint8Array[]>((resolve, reject) => {
			const readData: Uint8Array[] = []

			file.ondata = (error, currentChunk, final) => {
				if (error) {
					file.terminate()
					reject(error)
				} else if (currentChunk) {
					readData.push(currentChunk)
				}

				if (final) {
					resolve(readData)
				}
			}

			file.start()
		})
	}
}
