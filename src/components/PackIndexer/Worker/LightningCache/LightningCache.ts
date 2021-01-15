import { FileType } from '@/appCycle/FileType'
import { execute } from '@/components/Plugins/Scripts/execute'
import { hashString } from '@/utils/hash'
import { walkObject } from '@/utils/walkObject'
import json5 from 'json5'
import { PackIndexerService } from '../Main'
import { LightningStore } from './LightningStore'

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

export class LightningCache {
	constructor(
		protected service: PackIndexerService,
		protected lightningStore: LightningStore
	) {}

	async start() {
		if (this.service.settings.noFullLightningCacheRefresh) {
			const filePaths = await this.lightningStore.allFiles()
			if (filePaths.length > 0) return filePaths
		}

		let anyFileChanged = false
		const filePaths: string[] = []
		await this.iterateDir(
			this.service.fileSystem.baseDirectory,
			async (fileHandle, filePath) => {
				const fileDidChange = await this.processFile(
					filePath,
					fileHandle
				)
				if (fileDidChange && !anyFileChanged) anyFileChanged = true
				filePaths.push(filePath)

				this.service.progress.addToCurrent()
			}
		)

		if (anyFileChanged) await this.lightningStore.saveStore()

		return filePaths
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
				this.service.progress.addToTotal(2)
				await callback(entry as FileSystemFileHandle, currentFullPath)
			}
		}
	}

	/**
	 * @returns Whether this file did change
	 */
	async processFile(filePath: string, fileHandle: FileSystemFileHandle) {
		if (filePath.endsWith('.json'))
			return await this.processJSON(filePath, fileHandle)
		if (filePath.endsWith('.mcfunction'))
			return await this.processFunction(filePath, fileHandle)
		return false
	}

	async processFunction(filePath: string, fileHandle: FileSystemFileHandle) {
		const file = await fileHandle.getFile()
		const fileContent = await file.text()

		// Check for file changes
		const newHash = await hashString(fileContent)
		const oldHash = await this.lightningStore.getHash(filePath)
		// File did not change, no work to do
		if (newHash === oldHash) return false

		const functionPath: string[] = []
		for (const line of fileContent.split('\n')) {
			let funcName = /function\s+([aA-zZ0-9\/]+)/g.exec(line)
			if (funcName)
				functionPath.push(`functions/${funcName[1]}.mcfunction`)
		}

		await this.lightningStore.add(filePath, newHash, { functionPath })
		return true
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
			await this.lightningStore.add(filePath, newHash)
			return true
		}

		const instructions = await FileType.getLightningCache(filePath)
		// No instructions = no work
		if (instructions.length === 0) {
			await this.lightningStore.add(filePath, newHash)
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

		for (const instruction of instructions) {
			const key = Object.keys(instruction).find(
				key => key !== '@filter' && key !== '@map'
			)
			if (!key) continue
			const paths = instruction[key] as string[]

			if (Array.isArray(paths)) {
				for (const path of paths) {
					walkObject(
						path,
						data,
						onReceiveData(
							key,
							instruction['@filter'],
							instruction['@map']
						)
					)
				}
			} else {
				walkObject(
					paths,
					data,
					onReceiveData(
						key,
						instruction['@filter'],
						instruction['@map']
					)
				)
			}
		}

		await this.lightningStore.add(
			filePath,
			newHash,
			Object.keys(collectedData).length > 0 ? collectedData : undefined
		)

		return true
	}
}
