import { expose } from 'comlink'
import { Unzip, UnzipFile, UnzipInflate } from 'fflate'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { basename, dirname, join } from '/@/utils/path'
import { SimpleTaskService } from '/@/components/TaskManager/SimpleWorkerTask'
import { Signal } from '/@/components/Common/Event/Signal'

export class StreamingUnzipperWorker extends SimpleTaskService {
	protected unzipper = new Unzip()
	protected fileSystem = new FileSystem(this.directory)
	public readonly ready = new Signal<void>()

	constructor(protected directory: FileSystemDirectoryHandle) {
		super()

		this.unzipper.register(UnzipInflate)
		this.progress.setTotal(0)
		this.unzipper.onfile = async (file) => {
			const name = basename(file.name)
			const parentDirName = dirname(file.name)

			if (name.startsWith('.') || file.name.endsWith('/')) {
				return
			}
			this.progress.addToTotal()

			const fileHandle = await this.fileSystem.getFileHandle(
				join(parentDirName, name),
				true
			)
			const writable = await fileHandle.createWritable()

			const data = await this.readFile(file)
			for (const d of data) await writable.write(d)
			await writable.close()

			this.progress.addToCurrent()
		}
	}

	push(data: Uint8Array) {
		this.unzipper.push(data)
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

expose(StreamingUnzipperWorker)
