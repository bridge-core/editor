import { FileType } from '@/appCycle/FileType'
import json5 from 'json5'
import * as Comlink from 'comlink'
import { TaskService } from '@/components/TaskManager/WorkerTask'
import { hashString } from '@/utils/hash'
import { walkObject } from '@/utils/walkObject'
import { LightningStore } from './LightningStore'
import {
	fileStore,
	getCategoryDirectory,
	getFileStoreDirectory,
	PackSpider,
} from './PackSpider/PackSpider'
import { execute } from '@/components/Plugins/Scripts/execute'

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
	'bridge',
]

export interface ILightningInstruction {
	'@filter'?: string[]
	'@map'?: string
	[str: string]: undefined | string | string[]
}

export class PackIndexerService extends TaskService {
	protected lightningStore: LightningStore
	protected packSpider: PackSpider
	constructor(baseDirectory: FileSystemDirectoryHandle) {
		super('packIndexer', baseDirectory)
		this.lightningStore = new LightningStore(this)
		this.packSpider = new PackSpider(this, this.lightningStore)
	}

	async onStart() {
		this.lightningStore.reset()
		await FileType.setup()

		const filePaths: string[] = []

		await this.iterateDir(
			this.fileSystem.baseDirectory,
			async (fileHandle, filePath) => {
				const fileDidChange = await this.processFile(
					filePath,
					fileHandle
				)
				filePaths.push(filePath)

				this.progress.addToCurrent()
			}
		)

		await this.lightningStore.saveStore()

		await this.packSpider.setup(filePaths)

		console.log(fileStore)
	}

	async updateFile(filePath: string) {
		await FileType.setup()
		await this.processFile(
			filePath,
			await this.fileSystem.getFileHandle(filePath)
		)
		await this.lightningStore.saveStore()
		await this.packSpider.updateFile(filePath)
	}

	protected async iterateDir(
		baseDir: FileSystemDirectoryHandle,
		callback: (
			file: FileSystemFileHandle,
			filePath: string
		) => void | Promise<void>,
		fullPath = ''
	) {
		for await (const [fileName, entry] of baseDir.entries()) {
			const currentFullPath =
				fullPath.length === 0 ? fileName : `${fullPath}/${fileName}`

			if (entry.kind === 'directory') {
				if (folderIgnoreList.includes(currentFullPath)) continue

				await this.iterateDir(entry, callback, currentFullPath)
			} else if (!fileIgnoreList.includes(fileName)) {
				this.progress.addToTotal(2)
				await callback(entry as FileSystemFileHandle, currentFullPath)
			}
		}
	}

	async readdir(path: string[]) {
		if (path.length === 0) return getFileStoreDirectory()
		if (path.length === 1) return getCategoryDirectory(path[0])
		return fileStore[path[0]][path[1]].toDirectory()
	}

	/**
	 * @returns Whether this file did change
	 */
	async processFile(filePath: string, fileHandle: FileSystemFileHandle) {
		if (filePath.endsWith('.json'))
			return await this.processJSON(filePath, fileHandle)
		return false
	}
	/**
	 * Process a JSON file
	 * @returns Whether this json file did change
	 */
	async processJSON(filePath: string, fileHandle: FileSystemFileHandle) {
		const file = await fileHandle.getFile()
		const fileContent = await file.text()

		// Check for file changes
		const newHash = await hashString(fileContent)
		const oldHash = await this.lightningStore.getHash(filePath)
		// File did not change, no work to do
		if (newHash === oldHash) return false
		let data: any
		try {
			data = json5.parse(fileContent)
		} catch {
			return true
		}

		const instructions = await FileType.getLightningCache(filePath)
		// No instructions = no work
		if (instructions.length === 0) {
			await this.lightningStore.add(filePath, fileContent)
			return true
		}

		// console.log(instructions)
		const collectedData: Record<string, string[]> = {}
		const onReceiveData = (
			key: string,
			filter?: string[],
			mapFunc?: string
		) => (data: any) => {
			let readyData: string[]
			if (Array.isArray(data)) readyData = data
			else if (typeof data === 'object')
				readyData = Object.keys(data ?? {})
			else readyData = [data]

			if (filter) readyData = readyData.filter(d => !filter.includes(d))
			if (mapFunc)
				readyData = readyData
					.map(value => execute(mapFunc, { value }))
					.filter(value => value !== undefined)

			if (!collectedData[key]) collectedData[key] = readyData
			else
				collectedData[key] = [
					...new Set(collectedData[key].concat(readyData)),
				]
		}

		await Promise.all(
			instructions.map(async instruction => {
				const key = Object.keys(instruction).find(
					key => key !== '@filter' && key !== '@map'
				)
				if (!key) return
				const paths = instruction[key] as string[]

				if (Array.isArray(paths))
					await Promise.all(
						paths.map(path =>
							walkObject(
								path,
								data,
								onReceiveData(
									key,
									instruction['@filter'],
									instruction['@map']
								)
							)
						)
					)
				else
					await walkObject(
						paths,
						data,
						onReceiveData(
							key,
							instruction['@filter'],
							instruction['@map']
						)
					)
			})
		)

		await this.lightningStore.add(
			filePath,
			fileContent,
			Object.keys(collectedData).length > 0 ? collectedData : undefined
		)

		return true
	}
}

Comlink.expose(PackIndexerService, self)
