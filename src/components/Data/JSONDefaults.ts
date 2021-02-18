import { App } from '@/App'
import { FileType, IMonacoSchemaArrayEntry } from '@/components/Data/FileType'
import json5 from 'json5'
import * as monaco from 'monaco-editor'
import { runAsync } from '../Extensions/Scripts/run'
import { v4 as uuid } from 'uuid'
import { getFilteredFormatVersions } from './FormatVersions'
import { Project } from '../Projects/Project/Project'
import { IDisposable } from '@/types/disposable'

const globalSchemas: Record<string, IMonacoSchemaArrayEntry> = {}
let loadedGlobalSchemas = false
export class JsonDefaults {
	protected loadedSchemas = false
	protected localSchemas: Record<string, IMonacoSchemaArrayEntry> = {}
	protected disposables: IDisposable[] = []

	constructor(protected project: Project) {}

	async activate() {
		console.time('[SETUP] JSONDefaults')

		const app = await App.getApp()

		this.disposables = <IDisposable[]>[
			App.eventSystem.on('fileUpdated', (filePath: string) =>
				this.updateDynamicSchemas(filePath)
			),

			// Updating currentContext/ references
			App.eventSystem.on('currentTabSwitched', (filePath: string) =>
				this.updateDynamicSchemas(filePath)
			),
			App.eventSystem.on('refreshCurrentContext', (filePath: string) =>
				this.updateDynamicSchemas(filePath)
			),
			App.eventSystem.on('disableValidation', () => {
				this.setJSONDefaults(false)
			}),
			app.actionManager.create({
				icon: 'mdi-reload',
				name: 'actions.reloadAutoCompletions.name',
				description: 'actions.reloadAutoCompletions.description',
				keyBinding: 'Ctrl + Shift + R',
				onTrigger: () => this.reload(),
			}),
		].filter(disposable => disposable !== undefined)

		if (!this.loadedSchemas) await this.loadAllSchemas()
		this.setJSONDefaults()
		console.timeEnd('[SETUP] JSONDefaults')
	}

	deactivate() {
		this.disposables.forEach(disposable => disposable.dispose())
	}

	async loadAllSchemas() {
		this.localSchemas = {}
		const app = await App.getApp()

		try {
			await this.loadStaticSchemas(
				await app.fileSystem.getDirectoryHandle('data/packages/schema')
			)
		} catch {
			return
		}

		this.addSchemas(await this.getDynamicSchemas(), false)

		await this.runSchemaScripts(app)
		const tab = this.project.tabSystem?.selectedTab
		if (tab) {
			const fileType = FileType.getId(tab.getPackPath())
			this.addSchemas(
				await this.requestSchemaFor(fileType, tab.getPackPath()),
				false
			)
			await this.runSchemaScripts(app, tab.getPackPath())
		}

		this.loadedSchemas = true
	}

	setJSONDefaults(validate = true) {
		monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
			enableSchemaRequest: false,
			allowComments: true,
			validate,
			schemas: Object.values(
				Object.assign({}, globalSchemas, this.localSchemas)
			),
		})
	}

	async reload() {
		const app = await App.getApp()

		app.windows.loadingWindow.open()
		await this.loadAllSchemas()
		app.windows.loadingWindow.close()
	}

	async updateDynamicSchemas(filePath: string) {
		const app = await App.getApp()
		const fileType = FileType.getId(filePath)
		this.addSchemas(await this.requestSchemaFor(fileType, filePath), false)
		await this.runSchemaScripts(app, filePath)
		this.setJSONDefaults()
	}

	addSchemas(addSchemas: IMonacoSchemaArrayEntry[], updateMonaco = true) {
		addSchemas.forEach(addSchema => {
			if (this.localSchemas[addSchema.uri]) {
				if (addSchema.schema)
					this.localSchemas[addSchema.uri].schema = addSchema.schema
				if (addSchema.fileMatch)
					this.localSchemas[addSchema.uri].fileMatch =
						addSchema.fileMatch
			} else this.localSchemas[addSchema.uri] = addSchema
		})

		if (updateMonaco) this.setJSONDefaults()
	}

	async requestSchemaFor(fileType: string, fromFilePath?: string) {
		const packIndexer = this.project.packIndexer

		return await packIndexer.service!.getSchemasFor(fileType, fromFilePath)
	}
	async getDynamicSchemas() {
		return (
			await Promise.all(
				FileType.getIds().map(id => this.requestSchemaFor(id))
			)
		).flat()
	}
	async loadStaticSchemas(
		directoryHandle: FileSystemDirectoryHandle,
		fromPath = 'data/packages/schema'
	) {
		if (loadedGlobalSchemas) return

		const promises: Promise<void>[] = []
		for await (const [name, entry] of directoryHandle.entries()) {
			const currentPath = `${fromPath}/${name}`
			if (entry.name === '.DS_Store') continue

			if (entry.kind === 'file') {
				globalSchemas[`file:///${currentPath}`] = {
					uri: `file:///${currentPath}`,
					schema: await entry
						.getFile()
						.then(file => file.text())
						.then(json5.parse)
						.catch(() => {
							throw new Error(
								`Failed to load schema "${currentPath}"`
							)
						}),
				}
			} else {
				promises.push(this.loadStaticSchemas(entry, currentPath))
			}
		}

		await Promise.all(promises)

		// Only if this is the original call to loadStaticSchemas...
		if (fromPath !== 'data/packages/schema') return

		// ...add file type entries
		FileType.getMonacoSchemaArray().forEach(addSchema => {
			// Non-json files; e.g. .lang
			if (!addSchema.uri) return

			if (globalSchemas[addSchema.uri]) {
				if (addSchema.schema)
					globalSchemas[addSchema.uri].schema = addSchema.schema
				if (addSchema.fileMatch)
					globalSchemas[addSchema.uri].fileMatch = addSchema.fileMatch
			} else globalSchemas[addSchema.uri] = addSchema
		})
		loadedGlobalSchemas = true
	}
	async runSchemaScripts(app: App, filePath?: string) {
		const baseDirectory = await app.fileSystem.getDirectoryHandle(
			'data/packages/schemaScript'
		)
		const scopedFs = this.project.fileSystem

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
							const packIndexer = this.project.packIndexer

							return packIndexer.service!.getCacheDataFor(
								fileType,
								filePath,
								cacheKey
							)
						},
						() => app.projectConfig.get('prefix'),
						() =>
							!filePath
								? undefined
								: filePath.split(/\/|\\/g).pop(),
					],
					[
						'readdir',
						'uuid',
						'getFormatVersions',
						'getCacheDataFor',
						'getProjectPrefix',
						'getFileName',
					]
				)
			} catch (err) {
				// console.error(`Error evaluating schemaScript: ${err.message}`)
			}

			this.localSchemas[
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
}
