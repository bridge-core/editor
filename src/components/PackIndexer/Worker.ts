import { FileType } from '@/appCycle/FileType'
import { get, set } from 'idb-keyval'
import json5 from 'json5'
import * as Comlink from 'comlink'
import { TaskService } from '../TaskManager/WorkerTask'

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

export class PackIndexerService extends TaskService {
	constructor(baseDirectory: FileSystemDirectoryHandle) {
		super('packIndexer', baseDirectory)
	}

	async onStart() {
		await FileType.setup()

		const count: Record<string, number> = {}

		await this.iterateDir(
			this.fileSystem.baseDirectory,
			async (file, filePath) => {
				const fileType = FileType.getId(
					filePath.replace('projects/test/', '')
				)

				if (!count[fileType]) count[fileType] = 1
				else count[fileType]++

				this.progress.addToTotal()
			}
		)
		console.log(count)
	}

	protected async iterateDir(
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
				await this.iterateDir(entry, callback, currentFullPath)
			} else if (!fileIgnoreList.includes(fileName)) {
				this.progress.addToCurrent()
				promises.push(
					callback(entry as FileSystemFileHandle, currentFullPath)
				)
			}
		}

		await Promise.all(promises)
	}
}

Comlink.expose(PackIndexerService, self)

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
