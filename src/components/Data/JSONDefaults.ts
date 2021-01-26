import { App } from '@/App'
import { FileType, IMonacoSchemaArrayEntry } from '@/components/Data/FileType'
import * as monaco from 'monaco-editor'

export namespace JSONDefaults {
	let schemas: IMonacoSchemaArrayEntry[] = []

	async function getDynamicSchemas() {
		return (
			await Promise.all(FileType.getIds().map(id => requestSchemaFor(id)))
		).flat()
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

	async function loadAllSchemas() {
		schemas = FileType.getMonacoSchemaArray().concat(
			await getDynamicSchemas()
		)
	}

	function setJSONDefaults() {
		monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
			enableSchemaRequest: true,
			allowComments: true,
			validate: true,
			schemas,
		})
	}

	export function addSchemas(addSchemas: IMonacoSchemaArrayEntry[]) {
		console.log(addSchemas)
		addSchemas.forEach(addSchema => {
			const findSchema = schemas.find(
				schema => schema.uri === addSchema.uri
			)

			if (findSchema) findSchema.schema = addSchema.schema
			else schemas.push(addSchema)
		})

		setJSONDefaults()
	}

	export function setup() {
		App.ready.once(app => {
			app.packIndexer.on(async () => {
				console.log('SETTING UP MONACO')
				await loadAllSchemas()
				console.log(schemas)
				setJSONDefaults()
				console.log('DONE')
			})
		})

		App.eventSystem.on('fileUpdated', async filePath => {
			const fileType = FileType.getId(filePath)
			addSchemas(await requestSchemaFor(fileType))
		})

		// Updating currentContext/ references
		App.eventSystem.on('currentTabSwitched', async filePath => {
			console.log(filePath)
			const fileType = FileType.getId(filePath)
			addSchemas(await requestSchemaFor(fileType, filePath))
		})
	}
}
