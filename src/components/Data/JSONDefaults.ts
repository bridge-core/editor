import { App } from '@/App'
import { FileType, IMonacoSchemaArrayEntry } from '@/components/Data/FileType'
import * as monaco from 'monaco-editor'

export namespace JSONDefaults {
	let schemas: IMonacoSchemaArrayEntry[] = []

	async function getDynamicSchemas() {
		return (
			await Promise.all(
				FileType.getIds().map(
					id =>
						new Promise<IMonacoSchemaArrayEntry[]>(
							async resolve => {
								const app = await App.getApp()
								app.packIndexer.once(async () => {
									resolve(
										await app.packIndexer.service.getSchemasFor(
											id
										)
									)
								})
							}
						)
				)
			)
		).flat()
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
				setJSONDefaults()
				console.log('DONE')
			})
		})

		App.eventSystem.on('fileUpdated', filePath => {
			// TODO: Request new schemas for file and add them
		})
		App.eventSystem.on('currentTabSwitched', filePath => {
			// TODO: Update currentFile/ references
		})
	}
}
