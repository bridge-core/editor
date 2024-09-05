import { fileSystem, selectOrLoadBridgeFolder } from '@/libs/fileSystem/FileSystem'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { streamingUnzip } from '@/libs/zip/StreamingUnzipper'
import { join } from 'pathe'

export async function importFromBrProject(arrayBuffer: ArrayBuffer) {
	if (fileSystem instanceof PWAFileSystem && !fileSystem.setup) await selectOrLoadBridgeFolder()

	if (await fileSystem.exists('/import')) await fileSystem.removeDirectory('/import')

	const buffer = new Uint8Array(arrayBuffer)

	await streamingUnzip(buffer, async (file) => {
		console.log(file.name)

		const path = join('/import', file.name)

		await fileSystem.ensureDirectory(path)

		await fileSystem.writeFileStreaming(path, file)
	})
}
