import { App } from '@/App'
import { FileType, IMonacoSchemaArrayEntry } from '@/components/Data/FileType'
import { whenIdle } from '@/utils/whenIdle'
import json5 from 'json5'
import * as monaco from 'monaco-editor'
import { runAsync } from '../Extensions/Scripts/run'
import { FileSystem } from '../FileSystem/FileSystem'
import { v4 as uuid } from 'uuid'
import { getFilteredFormatVersions } from './FormatVersions'

export namespace JSONDefaults {
	let schemas: Record<string, IMonacoSchemaArrayEntry> = {}

	export function addSchemas(
		addSchemas: IMonacoSchemaArrayEntry[],
		updateMonaco = true
	) {
		// console.log(addSchemas)
		addSchemas.forEach(addSchema => {
			if (schemas[addSchema.uri]) {
				if (addSchema.schema)
					schemas[addSchema.uri].schema = addSchema.schema
				if (addSchema.fileMatch)
					schemas[addSchema.uri].fileMatch = addSchema.fileMatch
			} else schemas[addSchema.uri] = addSchema
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
		directoryHandle: FileSystemDirectoryHandle,
		fromPath = 'data/packages/schema'
	) {
		const promises: Promise<void>[] = []
		for await (const [name, entry] of directoryHandle.entries()) {
			const currentPath = `${fromPath}/${name}`
			if (entry.name === '.DS_Store') continue

			if (entry.kind === 'file') {
				schemas[`file:///${currentPath}`] = {
					uri: `file:///${currentPath}`,
					schema: await entry
						.getFile()
						.then(file => file.text())
						.then(json5.parse),
				}
			} else {
				promises.push(loadStaticSchemas(entry, currentPath))
			}
		}

		await Promise.all(promises)
	}
	async function runSchemaScripts(app: App) {
		const baseDirectory = await app.fileSystem.getDirectoryHandle(
			'data/packages/schemaScript'
		)
		const scopedFs = new FileSystem(
			await app.fileSystem.getDirectoryHandle(
				`projects/${app.selectedProject}`
			)
		)

		for await (const dirent of baseDirectory.values()) {
			if (dirent.kind !== 'file' || dirent.name === '.DS_Store') continue

			const file = await dirent.getFile()
			const schemaScript = json5.parse(await file.text())

			let scriptResult: string[] = []
			try {
				scriptResult = await runAsync(
					schemaScript.script,
					[
						scopedFs.readFilesFromDir.bind(scopedFs),
						uuid,
						getFilteredFormatVersions,
						async (
							fileType: string,
							filePath?: string,
							cacheKey?: string
						) => {
							const app = await App.getApp()
							await app.packIndexer.fired

							return app.packIndexer.service.getCacheDataFor(
								fileType,
								filePath,
								cacheKey
							)
						},
						app.projectConfig.get.bind(app.projectConfig),
					],
					[
						'readdir',
						'uuid',
						'getFormatVersions',
						'getCacheDataFor',
						'getFromConfig',
					]
				)
			} catch (err) {
				// console.error(`Error evaluating schemaScript: ${err.message}`)
			}

			schemas[
				`file:///data/packages/schema/${schemaScript.generateFile}`
			] = {
				uri: `file:///data/packages/schema/${schemaScript.generateFile}`,
				schema: {
					type: schemaScript.type === 'enum' ? 'string' : 'object',
					enum:
						schemaScript.type === 'enum' ? scriptResult : undefined,
					object:
						schemaScript.type === 'properties'
							? Object.fromEntries(
									scriptResult.map(res => [res, {}])
							  )
							: undefined,
				},
			}
		}
	}

	async function loadAllSchemas() {
		schemas = {}
		const app = await App.getApp()

		try {
			await loadStaticSchemas(
				await app.fileSystem.getDirectoryHandle('data/packages/schema')
			)
		} catch {
			return
		}

		addSchemas(FileType.getMonacoSchemaArray(), false)
		addSchemas(await getDynamicSchemas(), false)

		await runSchemaScripts(app)
		const tab = app.tabSystem?.selectedTab
		if (tab) {
			const fileType = FileType.getId(tab.getPackPath())
			addSchemas(await requestSchemaFor(fileType, tab.getPackPath()))
		}
		setJSONDefaults()
	}

	function setJSONDefaults(validate = true) {
		monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
			enableSchemaRequest: false,
			allowComments: true,
			validate,
			schemas: Object.values(schemas),
		})
	}

	export function setup() {
		App.ready.once(app => {
			app.packIndexer.on(() =>
				whenIdle(async () => {
					console.time('[EDITOR] Setting up JSON defaults')

					await loadAllSchemas()

					console.timeEnd('[EDITOR] Setting up JSON defaults')
				})
			)

			app.actionManager.create({
				icon: 'mdi-reload',
				name: 'actions.reloadAutoCompletions.name',
				description: 'actions.reloadAutoCompletions.description',
				keyBinding: 'Ctrl + Shift + R',
				onTrigger: () => reload(),
			})
		})

		App.eventSystem.on('fileUpdated', async filePath => {
			const fileType = FileType.getId(filePath)
			const app = await App.getApp()
			addSchemas(await requestSchemaFor(fileType))
			await runSchemaScripts(app)
		})

		// Updating currentContext/ references
		App.eventSystem.on('currentTabSwitched', async filePath => {
			const fileType = FileType.getId(filePath)
			addSchemas(await requestSchemaFor(fileType, filePath))
		})
		App.eventSystem.on('refreshCurrentContext', async filePath => {
			const fileType = FileType.getId(filePath)
			addSchemas(await requestSchemaFor(fileType, filePath))
		})
		App.eventSystem.on('disableValidation', () => {
			setJSONDefaults(false)
		})
	}

	export async function reload() {
		const app = await App.getApp()

		app.windows.loadingWindow.open()
		await loadAllSchemas()
		app.windows.loadingWindow.close()
	}
}
