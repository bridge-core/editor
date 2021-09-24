import { App } from '/@/App'
import { FileType, IMonacoSchemaArrayEntry } from '/@/components/Data/FileType'
import json5 from 'json5'
import * as monaco from 'monaco-editor'
import { Project } from '../Projects/Project/Project'
import { IDisposable } from '/@/types/disposable'
import { FileTab } from '../TabSystem/FileTab'
import { SchemaScript } from './SchemaScript'
import { SchemaManager } from '../JSONSchema/Manager'
import { EventDispatcher } from '../Common/Event/EventDispatcher'
import { AnyFileHandle } from '../FileSystem/Types'
import { Tab } from '../TabSystem/CommonTab'

let globalSchemas: Record<string, IMonacoSchemaArrayEntry> = {}
let loadedGlobalSchemas = false

export class JsonDefaults extends EventDispatcher<void> {
	protected loadedSchemas = false
	protected localSchemas: Record<string, IMonacoSchemaArrayEntry> = {}
	protected disposables: IDisposable[] = []

	constructor(protected project: Project) {
		super()
	}

	get isReady() {
		return this.loadedSchemas && loadedGlobalSchemas
	}

	async activate() {
		console.time('[SETUP] JSONDefaults')
		await this.project.app.project.packIndexer.fired

		this.disposables = <IDisposable[]>[
			// Updating currentContext/ references
			App.eventSystem.on('currentTabSwitched', (tab: Tab) => {
				if (
					tab instanceof FileTab &&
					FileType.isJsonFile(tab.getProjectPath())
				)
					this.updateDynamicSchemas(tab.getProjectPath())
			}),
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
		const task = app.taskManager.create({
			icon: 'mdi-book-open-outline',
			name: 'taskManager.tasks.loadingSchemas.name',
			description: 'taskManager.tasks.loadingSchemas.description',
			totalTaskSteps: 10,
		})

		await app.dataLoader.fired
		task.update(1)
		const packages = await app.dataLoader.readdir('data/packages')
		task.update(2)

		for (const packageName of packages) {
			try {
				await this.loadStaticSchemas(
					await app.dataLoader.getFileHandle(
						`data/packages/${packageName}/schemas.json`
					)
				)
			} catch (err) {
				console.error(err)
				continue
			}
		}
		loadedGlobalSchemas = true
		task.update(3)

		this.addSchemas(await this.getDynamicSchemas())
		task.update(4)

		await this.runSchemaScripts(app)
		task.update(5)
		const tab = this.project.tabSystem?.selectedTab
		if (tab && tab instanceof FileTab) {
			const fileType = FileType.getId(tab.getProjectPath())
			this.addSchemas(
				await this.requestSchemaFor(fileType, tab.getProjectPath())
			)
			await this.runSchemaScripts(
				app,
				tab.isForeignFile ? undefined : tab.getProjectPath()
			)
		}

		this.loadedSchemas = true
		task.update(6)
		task.complete()
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
		SchemaManager.setJSONDefaults(
			Object.assign({}, globalSchemas, this.localSchemas)
		)

		this.dispatch()
	}

	async reload() {
		const app = await App.getApp()

		app.windows.loadingWindow.open()
		this.loadedSchemas = false
		this.localSchemas = {}
		loadedGlobalSchemas = false
		globalSchemas = {}
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

		const updatedFileTypes = new Set<string>()

		for (const filePath of filePaths) {
			const fileType = FileType.getId(filePath)
			if (updatedFileTypes.has(fileType)) continue

			this.addSchemas(await this.requestSchemaFor(fileType))
			await this.runSchemaScripts(app, filePath)
			updatedFileTypes.add(fileType)
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
		await packIndexer.fired

		return await packIndexer.service!.getSchemasFor(fileType, fromFilePath)
	}
	async getDynamicSchemas() {
		return (
			await Promise.all(
				FileType.getIds().map((id) => this.requestSchemaFor(id))
			)
		).flat()
	}
	async loadStaticSchemas(fileHandle: AnyFileHandle) {
		if (loadedGlobalSchemas) return

		const file = await fileHandle.getFile()
		const schemas = json5.parse(await file.text())

		for (const uri in schemas) {
			globalSchemas[uri] = { uri, schema: schemas[uri] }
		}

		// ...add file type entries
		FileType.getMonacoSchemaArray().forEach((addSchema) => {
			// Non-json files; e.g. .lang
			if (!addSchema.uri) return

			if (globalSchemas[addSchema.uri]) {
				if (addSchema.schema)
					globalSchemas[addSchema.uri].schema = addSchema.schema

				if (addSchema.fileMatch) {
					if (globalSchemas[addSchema.uri].fileMatch)
						globalSchemas[addSchema.uri].fileMatch!.push(
							...addSchema.fileMatch
						)
					else
						globalSchemas[addSchema.uri].fileMatch =
							addSchema.fileMatch
				}
			} else {
				globalSchemas[addSchema.uri] = addSchema
			}
		})
	}

	async runSchemaScripts(app: App, filePath?: string) {
		const schemaScript = new SchemaScript(app, filePath)
		await schemaScript.runSchemaScripts(this.localSchemas)
	}
}
