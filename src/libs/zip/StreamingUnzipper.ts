import { NotificationSystem, Notification } from '@/components/Notifications/NotificationSystem'
import { AsyncUnzipInflate, Unzip, UnzipFile } from 'fflate'

export async function streamingUnzip(
	data: Uint8Array,
	callback: (file: UnzipFile) => Promise<void>,
	task?: Notification
) {
	let unzippedBytes = 0
	let totalFiles = 0
	let currentFiles = 0

	await new Promise<void>((resolve) => {
		const unzip = new Unzip(async (file) => {
			totalFiles++

			if (!file.name.endsWith('/')) await callback(file)

			unzippedBytes += file.size ?? 0

			if (task) NotificationSystem.setProgress(task, unzippedBytes)

			currentFiles++

			// I think that this is not compeltely safe, but it is the ONLY way I can find to test if the streaming unzipper is finished.
			if (currentFiles === totalFiles) {
				if (task) NotificationSystem.clearNotification(task)

				resolve()
			}
		})

		unzip.register(AsyncUnzipInflate)

		const chunks = getChunks(data)
		for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
			unzip.push(chunks[chunkIndex], chunkIndex == chunks.length - 1)
		}
	})
}

function getChunks(data: Uint8Array): Uint8Array[] {
	const chunks: Uint8Array[] = []

	const chunkSize = 64 * 1000 // 64kb

	for (let startByte = 0; startByte < data.length; startByte += chunkSize) {
		chunks.push(data.slice(startByte, Math.min(data.length, startByte + chunkSize)))
	}

	return chunks
}
