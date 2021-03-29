import { proxy, wrap } from 'comlink'
import { GenericUnzipper } from '../GenericUnzipper'
import { StreamingUnzipperWorker } from './Worker'

export class StreamingUnzipper extends GenericUnzipper<
	ReadableStream<Uint8Array>
> {
	protected worker = new Worker('./Worker.ts', { type: 'module' })
	protected workerClass = wrap<{
		new (directory: FileSystemDirectoryHandle): StreamingUnzipperWorker
	}>(this.worker)

	async unzip(stream: ReadableStream<Uint8Array>) {
		const unzipper = await new this.workerClass(this.directory)

		const reader = stream.getReader()

		let done = false
		while (!done) {
			const result = await reader.read()
			done = result.done

			if (!done) {
				await unzipper.push(result.value!)
			}
		}

		reader.cancel()

		await new Promise<void>((resolve) => {
			unzipper.on(
				proxy(([current, total]) => {
					this.task?.update(current, total)

					if (current === total) {
						this.task?.complete()
						resolve()
					}
				}),
				false
			)
		})

		this.worker.terminate()
	}
}
