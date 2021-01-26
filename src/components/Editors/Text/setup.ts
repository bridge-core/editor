import { App } from '@/App'
import { FileType, IMonacoSchemaArrayEntry } from '@/components/Data/FileType'
import * as monaco from 'monaco-editor'

async function getDynamicSchemas() {
	console.log(
		(
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
	)
	return (
		await Promise.all(
			FileType.getIds().map(
				id =>
					new Promise<IMonacoSchemaArrayEntry[]>(async resolve => {
						const app = await App.getApp()
						app.packIndexer.once(async () => {
							resolve(
								await app.packIndexer.service.getSchemasFor(id)
							)
						})
					})
			)
		)
	).flat()
}

async function setJSONDefaults() {
	monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
		enableSchemaRequest: true,
		allowComments: true,
		validate: true,
		schemas: FileType.getMonacoSchemaArray().concat(
			await getDynamicSchemas()
		),
	})
}

export function setupMonacoEditor() {
	App.ready.once(app => {
		app.packIndexer.on(async () => {
			console.log('SETTING UP MONACO')
			await setJSONDefaults()
			console.log('DONE')
		})
	})
}
