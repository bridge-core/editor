import { expose } from 'comlink'
import { Unzip, UnzipFile, UnzipInflate } from 'fflate'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { basename, dirname, join } from '/@/utils/path'
import { SimpleTaskService } from '/@/components/TaskManager/SimpleWorkerTask'
import { Signal } from '/@/components/Common/Event/Signal'
import { whenIdle } from '/@/utils/whenIdle'

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
			await this.processFile(file, writable)
			await writable.close()

			this.progress.addToCurrent()
		}
	}

	push(data: Uint8Array) {
		this.unzipper.push(data)
	}

	protected processFile(
		file: UnzipFile,
		writable: FileSystemWritableFileStream
	) {
		return new Promise<void>((resolve, reject) => {
			file.ondata = async (error, currentChunk, final) => {
				if (error) {
					file.terminate()
					reject(error)
				} else if (currentChunk) {
					await writable.write(currentChunk)
				}

				if (final) {
					resolve()
				}
			}

			file.start()
		})
	}
}

expose(StreamingUnzipperWorker)
