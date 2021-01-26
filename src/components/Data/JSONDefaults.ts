import { App } from '@/App'
import { FileType, IMonacoSchemaArrayEntry } from '@/components/Data/FileType'
import * as monaco from 'monaco-editor'
import { FileSystem } from '../FileSystem/Main'

export namespace JSONDefaults {
	let schemas: IMonacoSchemaArrayEntry[] = []

	export function addSchemas(
		addSchemas: IMonacoSchemaArrayEntry[],
		updateMonaco = true
	) {
		// console.log(addSchemas)
		addSchemas.forEach(addSchema => {
			const findSchema = schemas.find(
				schema => schema.uri === addSchema.uri
			)

			if (findSchema) {
				if (addSchema.schema) findSchema.schema = addSchema.schema
				if (addSchema.fileMatch)
					findSchema.fileMatch = addSchema.fileMatch
			} else schemas.push(addSchema)
		})

		if (updateMonaco) setJSONDefaults()
	}

	function requestSchemaFor(fileType: string, fromFilePath?: string) {
		return new Promise<IMonacoSchemaArrayEntry[]>(async resolve => {
			const app = await App.getApp()
			app.packIndexer.once(async () => {
				resolve(
					await app.packIndexer.service.getSchemasFor(
						fileType,
						fromFilePath
					)
				)
			})
		})
	}
	async function getDynamicSchemas() {
		return (
			await Promise.all(FileType.getIds().map(id => requestSchemaFor(id)))
		).flat()
	}
	async function loadStaticSchemas(
		fileSystem: FileSystem,
		fromPath = 'data/packages/schema'
	) {
		const dirents = await fileSystem.readdir(fromPath, {
			withFileTypes: true,
		})

		for (const dirent of dirents) {
			const currentPath = `${fromPath}/${dirent.name}`

			if (dirent.kind === 'file')
				schemas.push({
					uri: `file:///${currentPath}`,
					schema: await fileSystem.readJSON(currentPath),
				})
			else await loadStaticSchemas(fileSystem, currentPath)
		}
	}

	async function loadAllSchemas() {
		schemas = []
		const app = await App.getApp()
		await loadStaticSchemas(app.fileSystem)

		addSchemas(FileType.getMonacoSchemaArray(), false)
		addSchemas(await getDynamicSchemas(), false)
		setJSONDefaults()
	}

	function setJSONDefaults() {
		monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
			enableSchemaRequest: false,
			allowComments: true,
			validate: true,
			schemas,
		})
	}

	export function setup() {
		App.ready.once(app => {
			app.packIndexer.on(async () => {
				console.time('[EDITOR] Setting up JSON defaults')
				await loadAllSchemas()

				console.timeEnd('[EDITOR] Setting up JSON defaults')
			})

			app.actionManager.create({
				icon: 'mdi-reload',
				name: 'Reload Auto-Completions',
				description: 'Reloads all auto-completion data',
				keyBinding: 'Ctrl + Shift + R',
				onTrigger: () => reload(),
			})
		})

		App.eventSystem.on('fileUpdated', async filePath => {
			const fileType = FileType.getId(filePath)
			addSchemas(await requestSchemaFor(fileType))
		})

		// Updating currentContext/ references
		App.eventSystem.on('currentTabSwitched', async filePath => {
			// console.log(filePath)
			const fileType = FileType.getId(filePath)
			addSchemas(await requestSchemaFor(fileType, filePath))
		})
		App.eventSystem.on('refreshCurrentContext', async filePath => {
			// console.log(filePath)
			const fileType = FileType.getId(filePath)
			addSchemas(await requestSchemaFor(fileType, filePath))
		})
	}

	export async function reload() {
		const app = await App.getApp()

		app.windows.loadingWindow.open()
		await loadAllSchemas()
		app.windows.loadingWindow.close()
	}
}
