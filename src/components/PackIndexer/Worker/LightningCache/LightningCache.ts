import { FileType } from '@/components/Data/FileType'
import { run } from '@/components/Extensions/Scripts/run'
import { walkObject } from '@/utils/walkObject'
import json5 from 'json5'
import { PackIndexerService } from '../Main'
import { LightningStore } from './LightningStore'

export interface ILightningInstruction {
	'@filter'?: string[]
	'@map'?: string
	[str: string]: undefined | string | string[]
}

export class LightningCache {
	protected folderIgnoreList = new Set<string>()
	protected fileIgnoreList = new Set<string>(['.DS_Store'])
	protected totalTime = 0

	constructor(
		protected service: PackIndexerService,
		protected lightningStore: LightningStore
	) {}

	async loadIgnoreFolders() {
		try {
			const file = await this.service.fileSystem.readFile(
				'bridge/.ignore-folders'
			)
			;(await file.text())
				.split('\n')
				.concat(['bridge', 'builds', 'dev'])
				.forEach(folder => this.folderIgnoreList.add(folder))
		} catch {
			;['bridge', 'builds', 'dev'].forEach(folder =>
				this.folderIgnoreList.add(folder)
			)
		}
	}

	async start() {
		await this.lightningStore.setup()

		if (this.folderIgnoreList.size === 0) await this.loadIgnoreFolders()

		if (this.service.settings.noFullLightningCacheRefresh) {
			const filePaths = this.lightningStore.allFiles()
			if (filePaths.length > 0) return [filePaths, []]
		}

		let anyFileChanged = false
		const filePaths: string[] = []
		const changedFiles: string[] = []
		await this.iterateDir(
			this.service.fileSystem.baseDirectory,
			async (fileHandle, filePath) => {
				const fileDidChange = await this.processFile(
					filePath,
					fileHandle
				)

				if (fileDidChange) {
					if (!anyFileChanged) anyFileChanged = true
					changedFiles.push(filePath)
				}
				filePaths.push(filePath)

				this.service.progress.addToCurrent()
			}
		)

		if (anyFileChanged) await this.lightningStore.saveStore()
		return [filePaths, changedFiles]
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
				if (this.folderIgnoreList.has(currentFullPath)) continue
				await this.iterateDir(entry, callback, currentFullPath)
			} else if (!this.fileIgnoreList.has(fileName)) {
				this.service.progress.addToTotal(2)
				await callback(<FileSystemFileHandle>entry, currentFullPath)
			}
		}
	}

	/**
	 * @returns Whether this file did change
	 */
	async processFile(filePath: string, fileHandle: FileSystemFileHandle) {
		const file = await fileHandle.getFile()
		const fileType = FileType.getId(filePath)

		// First step: Check lastModified time. If the file was not modified, we can skip all processing
		if (
			file.lastModified ===
			this.lightningStore.getLastModified(filePath, fileType)
		) {
			return false
		}

		// Second step: Process file
		if (filePath.endsWith('.json'))
			await this.processJSON(filePath, fileType, file)
		else if (filePath.endsWith('.mcfunction'))
			await this.processFunction(filePath, fileType, file)
		else
			await this.lightningStore.add(
				filePath,
				{ lastModified: file.lastModified },
				fileType
			)
		return true
	}

	async processFunction(filePath: string, fileType: string, file: File) {
		const fileContent = await file.text()

		const functionPath: string[] = []
		for (const line of fileContent.split('\n')) {
			let funcName = /function\s+([aA-zZ0-9\/]+)/g.exec(line)
			if (funcName)
				functionPath.push(`functions/${funcName[1]}.mcfunction`)
		}

		await this.lightningStore.add(
			filePath,
			{
				lastModified: file.lastModified,
				data: { functionPath },
			},
			fileType
		)
		return true
	}

	/**
	 * Process a JSON file
	 * @returns Whether this json file did change
	 */
	async processJSON(filePath: string, fileType: string, file: File) {
		const fileContent = await file.text()

		let data: any
		try {
			data = json5.parse(fileContent)
		} catch {
			this.lightningStore.add(
				filePath,
				{
					lastModified: file.lastModified,
				},
				fileType
			)
			return true
		}

		const instructions = await FileType.getLightningCache(filePath)
		// No instructions = no work
		if (instructions.length === 0) {
			this.lightningStore.add(
				filePath,
				{
					lastModified: file.lastModified,
				},
				fileType
			)
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
					.map(value => run(mapFunc, { value }))
					.filter(value => value !== undefined)

			if (!collectedData[key]) collectedData[key] = readyData
			else
				collectedData[key] = [
					...new Set(collectedData[key].concat(readyData)),
				]
		}

		for (const instruction of instructions) {
			const key = Object.keys(instruction).find(
				key => !key.startsWith('@')
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

		this.lightningStore.add(
			filePath,
			{
				lastModified: file.lastModified,
				data:
					Object.keys(collectedData).length > 0
						? collectedData
						: undefined,
			},
			fileType
		)

		return true
	}
}
