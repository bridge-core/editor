import { FileType } from '@/appCycle/FileType'
import { get, set } from 'idb-keyval'
import json5 from 'json5'

const progress = { current: 0, total: 0, currentTotal: 0 }
self.addEventListener('message', async event => {
	progress.current = 0
	progress.total = await get('packIndexerLastTotalFileCount')
	await FileType.setup()

	const baseDirectory = event.data
	console.log(baseDirectory)

	const count: Record<string, number> = {}

	await iterateDir(baseDirectory, async (file, filePath) => {
		const fileType = FileType.getId(filePath.replace('projects/test/', ''))

		if (!count[fileType]) count[fileType] = 1
		else count[fileType]++

		updateProgress(1)
	})
	console.log(count)
	await set('packIndexerLastTotalFileCount', progress.current)
	self.postMessage({ isDone: true })
})

const fileIgnoreList = ['.DS_Store']
const folderIgnoreList = [
	'RP/textures/items',
	'RP/textures/blocks',
	'RP/textures/entity',
	'RP/textures/ui',
	'RP/textures/gui',
	'RP/ui',
	'RP/sounds/step',
	'RP/sounds/dig',
	'RP/sounds/block',
	'RP/sounds/mob',
]

async function iterateDir(
	baseDir: FileSystemDirectoryHandle,
	callback: (
		file: FileSystemFileHandle,
		filePath: string
	) => void | Promise<void>,
	fullPath = ''
) {
	const promises = []

	for await (const [fileName, entry] of baseDir.entries()) {
		const currentFullPath =
			fullPath.length === 0 ? fileName : `${fullPath}/${fileName}`
		if (
			entry.kind === 'directory' &&
			!folderIgnoreList.includes(
				currentFullPath.replace('projects/test/', '')
			)
		) {
			await iterateDir(entry, callback, currentFullPath)
		} else if (!fileIgnoreList.includes(fileName)) {
			updateProgress(undefined, 1)
			promises.push(
				callback(entry as FileSystemFileHandle, currentFullPath)
			)
		}
	}

	await Promise.all(promises)
}

function updateProgress(addCurrent?: number, addTotal?: number) {
	if (addCurrent) progress.current += addCurrent
	if (addTotal) progress.currentTotal += addTotal
	if (progress.currentTotal > progress.total)
		progress.total = progress.currentTotal

	self.postMessage({ progress })
}

async function processFile(file: FileSystemFileHandle) {
	if (file.name.endsWith('.json')) return await processJSON(file)
}
async function processJSON(fileHandle: FileSystemFileHandle) {
	const file = await fileHandle.getFile()
	let fileContent: any
	try {
		fileContent = json5.parse(await file.text())
	} catch {
		return
	}
}
