import { App } from '/@/App'
import { FileType, IMonacoSchemaArrayEntry } from '/@/components/Data/FileType'
import json5 from 'json5'
import * as monaco from 'monaco-editor'
import { runAsync } from '../Extensions/Scripts/run'
import { v4 as uuid } from 'uuid'
import { getFilteredFormatVersions } from './FormatVersions'
import { Project } from '../Projects/Project/Project'
import { IDisposable } from '/@/types/disposable'
import { generateComponentSchemas } from '../Compiler/Worker/Plugins/CustomComponent/generateSchemas'
import { iterateDir } from '/@/utils/iterateDir'
import { FileTab } from '../TabSystem/FileTab'

const globalSchemas: Record<string, IMonacoSchemaArrayEntry> = {}
let loadedGlobalSchemas = false
export class JsonDefaults {
	protected loadedSchemas = false
	protected localSchemas: Record<string, IMonacoSchemaArrayEntry> = {}
	protected disposables: IDisposable[] = []

	constructor(protected project: Project) {}

	async activate() {
		console.time('[SETUP] JSONDefaults')

		this.disposables = <IDisposable[]>[
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
		].filter((disposable) => disposable !== undefined)

		if (!this.loadedSchemas) await this.loadAllSchemas()
		this.setJSONDefaults()
		console.timeEnd('[SETUP] JSONDefaults')
	}

	deactivate() {
		this.disposables.forEach((disposable) => disposable.dispose())
		this.disposables = []
	}

	async loadAllSchemas() {
		this.localSchemas = {}
		const app = await App.getApp()

		try {
			await this.loadStaticSchemas(
				await app.fileSystem.getDirectoryHandle(
					'data/packages/minecraftBedrock/schema'
				)
			)
		} catch {
			return
		}

		this.addSchemas(await this.getDynamicSchemas())

		await this.runSchemaScripts(app)
		const tab = this.project.tabSystem?.selectedTab
		if (tab && tab instanceof FileTab) {
			const fileType = FileType.getId(tab.getProjectPath())
			this.addSchemas(
				await this.requestSchemaFor(fileType, tab.getProjectPath())
			)
			await this.runSchemaScripts(app, tab.getProjectPath())
		}

		this.loadedSchemas = true
	}

	setJSONDefaults(validate = true) {
		// console.log(
		// 	Object.values(Object.assign({}, globalSchemas, this.localSchemas))
		// )
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
		this.loadedSchemas = false
		this.localSchemas = {}
		await this.deactivate()
		await this.activate()
		app.windows.loadingWindow.close()
	}

	async updateDynamicSchemas(filePath: string) {
		const app = await App.getApp()
		const fileType = FileType.getId(filePath)

		this.addSchemas(await this.requestSchemaFor(fileType, filePath))
		this.addSchemas(await this.requestSchemaFor(fileType))
		await this.runSchemaScripts(app, filePath)
		this.setJSONDefaults()
	}
	async updateMultipleDynamicSchemas(filePaths: string[]) {
		const app = await App.getApp()

		for (const filePath of filePaths) {
			const fileType = FileType.getId(filePath)

			this.addSchemas(await this.requestSchemaFor(fileType, filePath))
			this.addSchemas(await this.requestSchemaFor(fileType))
			await this.runSchemaScripts(app, filePath)
		}

		this.setJSONDefaults()
	}

	addSchemas(addSchemas: IMonacoSchemaArrayEntry[]) {
		addSchemas.forEach((addSchema) => {
			if (this.localSchemas[addSchema.uri]) {
				if (addSchema.schema)
					this.localSchemas[addSchema.uri].schema = addSchema.schema
				if (addSchema.fileMatch)
					this.localSchemas[addSchema.uri].fileMatch =
						addSchema.fileMatch
			} else {
				this.localSchemas[addSchema.uri] = addSchema
			}
		})
	}

	async requestSchemaFor(fileType: string, fromFilePath?: string) {
		const packIndexer = this.project.packIndexer

		return await packIndexer.service!.getSchemasFor(fileType, fromFilePath)
	}
	async getDynamicSchemas() {
		return (
			await Promise.all(
				FileType.getIds().map((id) => this.requestSchemaFor(id))
			)
		).flat()
	}
	async loadStaticSchemas(
		directoryHandle: FileSystemDirectoryHandle,
		fromPath = 'data/packages/minecraftBedrock/schema'
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
						.then((file) => file.text())
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
		if (fromPath !== 'data/packages/minecraftBedrock/schema') return

		// ...add file type entries
		FileType.getMonacoSchemaArray().forEach((addSchema) => {
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
			'data/packages/minecraftBedrock/schemaScript'
		)
		const scopedFs = this.project.fileSystem

		await iterateDir(baseDirectory, async (fileHandle) => {
			const file = await fileHandle.getFile()
			const schemaScript = json5.parse(await file.text())

			let scriptResult: any = []
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
						() => app.projectConfig.get().namespace,
						() =>
							!filePath
								? undefined
								: filePath.split(/\/|\\/g).pop(),
						(fileType: string) =>
							generateComponentSchemas(fileType),
					],
					[
						'readdir',
						'uuid',
						'getFormatVersions',
						'getCacheDataFor',
						'getProjectPrefix',
						'getFileName',
						'customComponents',
					]
				)
			} catch (err) {
				// console.error(`Error evaluating schemaScript: ${err.message}`)
			}

			if (
				schemaScript.type === 'object' &&
				!Array.isArray(scriptResult) &&
				typeof scriptResult === 'object'
			) {
				this.localSchemas[
					`file:///data/packages/minecraftBedrock/schema/${schemaScript.generateFile}`
				] = {
					uri: `file:///data/packages/minecraftBedrock/schema/${schemaScript.generateFile}`,
					schema: {
						type: 'object',
						properties: scriptResult,
					},
				}

				return
			}

			this.localSchemas[
				`file:///data/packages/minecraftBedrock/schema/${schemaScript.generateFile}`
			] = {
				uri: `file:///data/packages/minecraftBedrock/schema/${schemaScript.generateFile}`,
				schema: {
					type: schemaScript.type === 'enum' ? 'string' : 'object',
					enum:
						schemaScript.type === 'enum' ? scriptResult : undefined,
					properties:
						schemaScript.type === 'properties'
							? Object.fromEntries(
									scriptResult.map((res: string) => [res, {}])
							  )
							: undefined,
				},
			}
		})
	}
}
