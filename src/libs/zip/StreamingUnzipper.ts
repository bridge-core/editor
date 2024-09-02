import { AsyncUnzipInflate, Unzip, UnzipFile } from 'fflate'

export async function streamingUnzip(data: Uint8Array, callback: (path: string, data: Uint8Array) => void) {
	const unzipStream = new Promise<void>(async (resolve, reject) => {
		const streams: UnzipFile[] = []

		const unzip = new Unzip(async (stream) => {
			streams.push(stream)
		})

		unzip.register(AsyncUnzipInflate)

		const chunks = getChunks(data)
		for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
			unzip.push(chunks[chunkIndex], chunkIndex == chunks.length - 1)
		}

		let streamedBytes = 0

		let streamQueue: { resolved: true; task: Promise<void> }[] = []

		for (const stream of streams) {
			if (stream.name.endsWith('/')) continue

			const queueItem: any = { resolved: false }

			queueItem.task = new Promise<void>(async (res) => {
				await streamFile(fs, stream).catch((err) => reject(err))

				queueItem.resolved = true

				res()
			})

			streamQueue.push(queueItem)

			if (streamQueue.length >= 10) {
				await Promise.any(streamQueue.map((element) => element.task))

				streamQueue = streamQueue.filter((element) => !element.resolved)
			}

			streamedBytes += stream.size ?? 0
		}

		resolve()
	})

	await unzipStream
}

function getChunks(data: Uint8Array): Uint8Array[] {
	const chunks: Uint8Array[] = []

	const chunkSize = 64 * 1000 // 64kb

	for (let startByte = 0; startByte < data.length; startByte += chunkSize) {
		chunks.push(data.slice(startByte, Math.min(data.length, startByte + chunkSize)))
	}

	return chunks
}

async function streamFile(fs: FileSystem, stream: UnzipFile) {
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
