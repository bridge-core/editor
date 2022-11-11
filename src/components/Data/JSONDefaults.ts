import { App } from '/@/App'
import { IMonacoSchemaArrayEntry } from '/@/components/Data/FileType'
import { Project } from '../Projects/Project/Project'
import { IDisposable } from '/@/types/disposable'
import { FileTab } from '../TabSystem/FileTab'
import { SchemaScript } from './SchemaScript'
import { SchemaManager } from '../JSONSchema/Manager'
import { EventDispatcher } from '../Common/Event/EventDispatcher'
import { AnyFileHandle } from '../FileSystem/Types'
import { Tab } from '../TabSystem/CommonTab'
import { ComponentSchemas } from '../Compiler/Worker/Plugins/CustomComponent/ComponentSchemas'
import { loadMonaco, useMonaco } from '../../utils/libs/useMonaco'
import { Task } from '../TaskManager/Task'

let globalSchemas: Record<string, IMonacoSchemaArrayEntry> = {}
let loadedGlobalSchemas = false

export class JsonDefaults extends EventDispatcher<void> {
	protected loadedSchemas = false
	protected localSchemas: Record<string, IMonacoSchemaArrayEntry> = {}
	protected disposables: IDisposable[] = []
	public readonly componentSchemas = new ComponentSchemas()
	protected task: Task | null = null

	constructor(protected project: Project) {
		super()
	}

	get isReady() {
		return this.loadedSchemas && loadedGlobalSchemas
	}

	async activate() {
		console.time('[SETUP] JSONDefaults')
		await this.project.app.project.packIndexer.fired

		await this.componentSchemas.activate()

		this.disposables = <IDisposable[]>[
			// Updating currentContext/ references
			App.eventSystem.on('currentTabSwitched', (tab: Tab) => {
				if (
					tab instanceof FileTab &&
					App.fileType.isJsonFile(tab.getPath())
				)
					this.updateDynamicSchemas(tab.getPath())
			}),
			App.eventSystem.on('refreshCurrentContext', (filePath: string) =>
				this.updateDynamicSchemas(filePath)
			),
			App.eventSystem.on('disableValidation', () => {
				this.setJSONDefaults(false)
			}),
		].filter((disposable) => disposable !== undefined)

		await this.loadAllSchemas()
		await this.setJSONDefaults()
		console.timeEnd('[SETUP] JSONDefaults')
	}

	deactivate() {
		this.disposables.forEach((disposable) => disposable.dispose())
		this.componentSchemas.dispose()
		this.disposables = []
		this.task?.complete()
		this.task = null
	}

	async loadAllSchemas() {
		this.localSchemas = {}
		const app = await App.getApp()
		this.task = app.taskManager.create({
			icon: 'mdi-book-open-outline',
			name: 'taskManager.tasks.loadingSchemas.name',
			description: 'taskManager.tasks.loadingSchemas.description',
			totalTaskSteps: 10,
		})

		await app.dataLoader.fired
		this.task?.update(1)
		const packages = await app.dataLoader.readdir('data/packages')
		this.task?.update(2)

		// Static schemas
		for (const packageName of packages) {
			try {
				await this.loadStaticSchemas(
					await app.dataLoader.getFileHandle(
						`data/packages/${packageName}/schemas.json`
					),
					packageName === 'minecraftBedrock'
				)
			} catch (err) {
				console.error(err)
				continue
			}
		}
		loadedGlobalSchemas = true
		this.task?.update(3)

		// Schema scripts
		await this.runSchemaScripts(app)
		this.task?.update(5)
		const tab = this.project.tabSystem?.selectedTab
		if (tab && tab instanceof FileTab) {
			const fileType = App.fileType.getId(tab.getPath())
			this.addSchemas(
				await this.requestSchemaFor(fileType, tab.getPath())
			)
			await this.runSchemaScripts(
				app,
				tab.isForeignFile ? undefined : tab.getPath()
			)
		}

		// Schemas generated from lightning cache
		this.addSchemas(await this.getDynamicSchemas())
		this.task?.update(4)

		this.loadedSchemas = true
		this.task?.update(6)
		this.task?.complete()
	}

	async setJSONDefaults(validate = true) {
		const schemas = Object.assign({}, globalSchemas, this.localSchemas)

		if (loadMonaco.hasFired) {
			const { languages } = await useMonaco()

			languages.json.jsonDefaults.setDiagnosticsOptions({
				enableSchemaRequest: false,
				allowComments: true,
				validate,
				schemas: Object.values(schemas),
			})
		}

		SchemaManager.setJSONDefaults(schemas)

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
		const fileType = App.fileType.getId(filePath)

		this.addSchemas(await this.requestSchemaFor(fileType, filePath))
		this.addSchemas(await this.requestSchemaFor(fileType))
		await this.runSchemaScripts(app, filePath)
		await this.setJSONDefaults()
	}
	async updateMultipleDynamicSchemas(filePaths: string[]) {
		const app = await App.getApp()

		const updatedFileTypes = new Set<string>()

		for (const filePath of filePaths) {
			const fileType = App.fileType.getId(filePath)
			if (updatedFileTypes.has(fileType)) continue

			this.addSchemas(await this.requestSchemaFor(fileType))
			await this.runSchemaScripts(app, filePath)
			updatedFileTypes.add(fileType)
		}

		await this.setJSONDefaults()
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
				App.fileType.getIds().map((id) => this.requestSchemaFor(id))
			)
		).flat()
	}
	async loadStaticSchemas(
		fileHandle: AnyFileHandle,
		updateSchemaEntries = false
	) {
		if (!loadedGlobalSchemas) {
			const file = await fileHandle.getFile()
			const schemas = JSON.parse(await file.text())

			for (const uri in schemas) {
				globalSchemas[uri] = { uri, schema: schemas[uri] }
			}
		}

		if (updateSchemaEntries) {
			// Fetch schema entry points
			const schemaEntries = App.fileType.getMonacoSchemaEntries()

			// Reset old file matchers
			schemaEntries.forEach((schemaEntry) => {
				if (!schemaEntry.uri) return

				const currSchema = globalSchemas[schemaEntry.uri]

				if (currSchema && currSchema.fileMatch && schemaEntry.fileMatch)
					currSchema.fileMatch = undefined
			})

			// Add schema entry points
			schemaEntries.forEach((schemaEntry) => {
				// Non-json files; e.g. .lang
				if (!schemaEntry.uri) return

				if (globalSchemas[schemaEntry.uri]) {
					if (schemaEntry.schema)
						globalSchemas[schemaEntry.uri].schema =
							schemaEntry.schema

					if (schemaEntry.fileMatch) {
						if (globalSchemas[schemaEntry.uri].fileMatch)
							globalSchemas[schemaEntry.uri].fileMatch!.push(
								...schemaEntry.fileMatch
							)
						else
							globalSchemas[schemaEntry.uri].fileMatch =
								schemaEntry.fileMatch
					}
				} else {
					globalSchemas[schemaEntry.uri] = schemaEntry
				}
			})
		}
	}

	addSchemaEntries() {}

	async runSchemaScripts(app: App, filePath?: string) {
		const schemaScript = new SchemaScript(this, app, filePath)
		await schemaScript.runSchemaScripts(this.localSchemas)
	}
}
