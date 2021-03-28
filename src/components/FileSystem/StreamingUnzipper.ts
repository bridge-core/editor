import { Unzip, AsyncUnzipInflate } from 'fflate'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { basename, dirname, join } from '/@/utils/path'

// TODO: This will bring great performance benefits but it's tricky to get 100% right
export async function unzipStreamToDirectory(
	stream: ReadableStream<Uint8Array>,
	directory: FileSystemDirectoryHandle
) {
	const fileSystem = new FileSystem(directory)
	const unzipper = new Unzip()
	let totalFiles = 0
	let processedFiles = 0

	unzipper.register(AsyncUnzipInflate)

	unzipper.onfile = async (file) => {
		const name = basename(file.name)
		const parentDirName = dirname(file.name)

		if (name.startsWith('.') || file.name.endsWith('/')) return
		totalFiles++

		const fileHandle = await fileSystem.getFileHandle(
			join(parentDirName, name),
			true
		)
		const writable = await fileHandle.createWritable()

		file.ondata = (error, data, final) => {
			if (error) {
				file.terminate()
				throw error
			}

			writable.write(data)
			if (final) {
				writable.close()
			}
		}

		file.start()
	}

	const reader = stream.getReader()

	while (true) {
		const { done, value } = await reader.read()
		unzipper.push(value ?? new Uint8Array(), done)

		if (done) break
	}
}
