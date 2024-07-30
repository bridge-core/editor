import { setSchemas } from '@/libs/monaco/Json'
import { Runtime } from '@/libs/runtime/Runtime'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { CompatabilityFileSystem } from '@/libs/fileSystem/CompatabilityFileSystem'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { v4 as uuid } from 'uuid'
import { walkObject } from 'bridge-common-utils'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { Data } from '@/libs/data/Data'
import { Disposable, disposeAll } from '@/libs/disposeable/Disposeable'
import { join, basename, dirname, resolve } from 'pathe'
import { DashData } from './DashData'

/*
Building the schema for a file is a little complicated.
We can't use simple references because different files need to "reuse" generated schemas with different values.
We need some way to swap out the references to these dynamically generated schemas

The idea here is to walk the dependency tree of the schema and replace all of the references with a modified path relative to a custom folder based on the path of the file
and then supply the referenced schema under the new path.
Before compiling we'll also generate the dynamic schemas which will be supplied when referenced durring the compile step.

Optimizations:
- pregenerate generated schemas for all the non dynamic schema scripts when the project loads to save time.
*/

interface SchemaScriptResult {
	data: any
	result: any
}

export class SchemaData implements Disposable {
	private schemas: any = {}

	private schemaScripts: any = {}
	private globalSchemaScriptResults: Record<string, SchemaScriptResult> = {}
	private localSchemaScripts: string[] = []
	private indexerSchemaScripts: string[] = []
	private fileSystemSchemaScripts: string[] = []

	private lightningCacheSchemas: Record<string, any> = {}

	private fileSchemas: Record<
		string,
		{
			main: string
			localSchemas: Record<string, any>
		}
	> = {}

	private filesToUpdate: { path: string; fileType?: string; schemaUri?: string }[] = []

	private runtime = new Runtime(fileSystem)
	public dashComponentsData: DashData

	private disposables: Disposable[] = []

	constructor(public project: BedrockProject) {
		this.dashComponentsData = new DashData(this.project)
	}

	private fixPaths(schemas: { [key: string]: any }) {
		return Object.fromEntries(
			Object.entries(schemas).map(([path, schema]) => [path.substring('file://'.length), schema])
		)
	}

	public async load() {
		await this.dashComponentsData.setup()

		this.disposables.push(this.project.indexerService.updated.on(this.indexerUpdated.bind(this)))
		this.disposables.push(fileSystem.pathUpdated.on(this.pathUpdated.bind(this)))

		this.indexerUpdated()

		this.schemas = {
			...this.fixPaths(await Data.get('/packages/common/schemas.json')),
			...this.fixPaths(await Data.get('/packages/minecraftBedrock/schemas.json')),
		}

		this.schemaScripts = this.fixPaths(await Data.get('/packages/minecraftBedrock/schemaScripts.json'))

		await this.runAllSchemaScripts()
	}

	public dispose() {
		this.dashComponentsData.dispose()

		disposeAll(this.disposables)
	}

	private async indexerUpdated() {
		for (const fileType of this.project.fileTypeData.fileTypes.map((fileType) => fileType.id)) {
			const chachedData = this.project.indexerService.getCachedData(fileType)

			if (chachedData === null) continue

			const collectedData = chachedData.reduce((accumulator: any, currentObject: any) => {
				for (const [key, value] of Object.entries(currentObject.data)) {
					accumulator[key] = (accumulator[key] ?? []).concat(value)
				}

				return accumulator
			}, {})

			const baseUrl = `/data/packages/minecraftBedrock/schema/${fileType}/dynamic`

			for (const key in collectedData) {
				this.lightningCacheSchemas[join(baseUrl, `${key}Enum.json`)] = {
					type: 'string',
					enum: collectedData[key],
				}

				this.lightningCacheSchemas[join(baseUrl, `${key}Property.json`)] = {
					properties: Object.fromEntries(collectedData[key].map((d: any) => [d, {}])),
				}
			}
		}

		for (const [path, scriptData] of Object.entries(this.schemaScripts)) {
			if (!this.indexerSchemaScripts.includes(path)) continue

			const result = await this.runScript(path, scriptData)

			if (this.localSchemaScripts.includes(path)) continue

			if (result === null) continue

			this.globalSchemaScriptResults[path] = result
		}

		for (const file of this.filesToUpdate) {
			this.updateSchemaForFile(file.path, file.fileType, file.schemaUri)
		}
	}

	private async pathUpdated() {
		for (const [path, scriptData] of Object.entries(this.schemaScripts)) {
			if (!this.fileSystemSchemaScripts.includes(path)) continue

			const result = await this.runScript(path, scriptData)

			if (this.localSchemaScripts.includes(path)) continue

			if (result === null) continue

			this.globalSchemaScriptResults[path] = result
		}

		for (const file of this.filesToUpdate) {
			this.updateSchemaForFile(file.path, file.fileType, file.schemaUri)
		}
	}

	private rebaseReferences(
		schemaPart: any,
		schemaPath: string,
		basePath: string
	): { references: string[]; rebasedSchemaPart: any } {
		let references: string[] = []

		if (Array.isArray(schemaPart)) {
			for (let index = 0; index < schemaPart.length; index++) {
				const result = this.rebaseReferences(schemaPart[index], schemaPath, basePath)

				schemaPart[index] = result.rebasedSchemaPart
				references = references.concat(result.references)
			}
		} else if (typeof schemaPart === 'object') {
			for (const key of Object.keys(schemaPart)) {
				if (key === '$ref') {
					let reference = schemaPart[key]

					if (reference.startsWith('#')) continue

					references.push(this.resolveSchemaPath(schemaPath, reference).split('#')[0])

					reference = join(
						resolve('/', basePath),
						this.resolveSchemaPath(schemaPath, reference.split('#')[0])
					)

					schemaPart[key] = reference

					continue
				}

				const result = this.rebaseReferences(schemaPart[key], schemaPath, basePath)

				schemaPart[key] = result.rebasedSchemaPart
				references = references.concat(result.references)
			}
		}

		return {
			references,
			rebasedSchemaPart: schemaPart,
		}
	}

	public async updateSchemaForFile(path: string, fileType?: string, schemaUri?: string) {
		if (schemaUri === undefined) {
			if (this.fileSchemas[path] !== undefined) delete this.fileSchemas[path]

			this.updateDefaults()

			return
		}

		if (schemaUri.startsWith('file://')) schemaUri = schemaUri.substring('file://'.length)

		const generatedGlobalSchemas: Record<string, any> = {}

		for (const [scriptPath, result] of Object.entries(this.globalSchemaScriptResults)) {
			generatedGlobalSchemas[join('/data/packages/minecraftBedrock/schema/', result.data.generateFile)] =
				result.result
		}

		const generatedDynamicSchemas: Record<string, any> = {}

		for (const scriptPath of this.localSchemaScripts) {
			const result = await this.runScript(scriptPath, this.schemaScripts[scriptPath], path)

			if (result === null) continue

			generatedDynamicSchemas[join('/data/packages/minecraftBedrock/schema/', result.data.generateFile)] =
				result.result
		}

		const contextLightningCacheSchemas: Record<string, any> = {}

		if (fileType) {
			const collectedData = this.project.indexerService.getCachedData(fileType, path)
			const baseUrl = `/data/packages/minecraftBedrock/schema/${fileType}/dynamic`

			for (const key in collectedData) {
				contextLightningCacheSchemas[join(baseUrl, 'currentContext', `${key}Enum.json`)] = {
					type: 'string',
					enum: collectedData[key],
				}

				contextLightningCacheSchemas[join(baseUrl, 'currentContext', `${key}Property.json`)] = {
					properties: Object.fromEntries(collectedData[key].map((d: any) => [d, {}])),
				}
			}
		}

		const localSchemas: Record<string, any> = {}

		let rebasedSchemas = []
		let schemasToRebaseQueue = [schemaUri]

		while (schemasToRebaseQueue.length > 0) {
			const schemaPathToRebase = schemasToRebaseQueue.shift()!
			rebasedSchemas.push(schemaPathToRebase)

			let schema =
				generatedDynamicSchemas[schemaPathToRebase] ??
				generatedGlobalSchemas[schemaPathToRebase] ??
				contextLightningCacheSchemas[schemaPathToRebase] ??
				this.lightningCacheSchemas[schemaPathToRebase] ??
				this.schemas[schemaPathToRebase]

			if (schema === undefined) {
				console.warn('Failed to load schema reference', schemaPathToRebase)

				schema = {}
			}

			const result = this.rebaseReferences(JSON.parse(JSON.stringify(schema)), schemaPathToRebase, path)

			for (let reference of result.references) {
				if (rebasedSchemas.includes(reference)) continue

				schemasToRebaseQueue.push(reference)
				rebasedSchemas.push(reference)
			}

			localSchemas[join(resolve('/', path), schemaPathToRebase)] = result.rebasedSchemaPart
		}

		this.fileSchemas[path] = {
			main: join(resolve('/', path), schemaUri),
			localSchemas,
		}

		this.updateDefaults()
	}

	public addFileForUpdate(path: string, fileType?: string, schemaUri?: string) {
		this.filesToUpdate.push({ path, fileType, schemaUri })
	}

	public removeFileForUpdate(path: string) {
		this.filesToUpdate.splice(
			this.filesToUpdate.findIndex((file) => file.path === path),
			1
		)
	}

	public getAndResolve(path: string, schemaBase?: any): any {
		if (path.startsWith('#')) {
			const objectPath = path.substring(1)

			let subSchema = null
			walkObject(objectPath, schemaBase, (foundData) => (subSchema = foundData))

			if (subSchema === null) {
				console.error(`Failed to find schema '${path}'`)

				return {}
			}

			return subSchema
		} else if (path.includes('#')) {
			const schemaPath = resolve('/', path.split('#')[0])
			const objectPath = path.split('#')[1].substring(1)

			let data = this.lightningCacheSchemas[schemaPath] ?? this.schemas[schemaPath]

			if (!data) {
				console.error(`Failed to find schema '${path}'`)

				return {}
			}

			data = JSON.parse(JSON.stringify(data))

			data = this.resolveReferences(schemaPath, data, data)

			let subSchema = null
			walkObject(objectPath, data, (foundData) => (subSchema = foundData))

			if (subSchema === null) {
				console.error(`Failed to find schema '${path}'`)

				return {}
			}

			return subSchema
		}

		path = resolve('/', path)

		let data = this.lightningCacheSchemas[path] ?? this.schemas[path]

		if (!data) {
			console.error(`Failed to find schema '${path}'`)

			return {}
		}

		data = JSON.parse(JSON.stringify(data))

		return this.resolveReferences(path, data, data)
	}

	public getAutocompletions(schema: any): string[] {
		if (typeof schema !== 'object') return []

		let completions: string[] = []

		for (const key of Object.keys(schema)) {
			if (key === 'enum') {
				return schema[key]
			}

			completions = completions.concat(this.getAutocompletions(schema[key]))
		}

		return completions
	}

	public getSchemasForFile(path: string): { main: string; localSchemas: Record<string, any> } {
		return this.fileSchemas[path]
	}

	private resolveSchemaPath(source: string, path: string): string {
		if (path.startsWith('#')) return source + path

		return resolve(dirname(source), path)
	}

	private resolveReferences(path: string, schemaPart: any, schemaBase: any): any {
		for (const key of Object.keys(schemaPart)) {
			if (key === '$ref') {
				let reference = this.resolveSchemaPath(path, schemaPart[key])

				const data = this.getAndResolve(reference, schemaBase)

				for (const otherKey of Object.keys(data)) {
					schemaPart[otherKey] = data[otherKey]
				}

				delete schemaPart['$ref']

				continue
			}

			if (typeof schemaPart[key] === 'object')
				schemaPart[key] = this.resolveReferences(path, schemaPart[key], schemaBase)
		}

		return schemaPart
	}

	private updateDefaults() {
		setSchemas(
			Object.entries(this.fileSchemas)
				.map(([filePath, schemaInfo]) => {
					return Object.entries(schemaInfo.localSchemas).map(([schemaPath, schema]) => ({
						uri: schemaPath,
						fileMatch: schemaPath === schemaInfo.main ? [filePath] : undefined,
						schema,
					}))
				})
				.flat()
		)
	}

	private async runAllSchemaScripts() {
		for (const [path, scriptData] of Object.entries(this.schemaScripts)) {
			const result = await this.runScript(path, scriptData)

			if (this.localSchemaScripts.includes(path)) continue

			if (result === null) continue

			this.globalSchemaScriptResults[path] = result
		}
	}

	private async runScript(
		scriptPath: string,
		scriptData: any,
		filePath?: string
	): Promise<SchemaScriptResult | null> {
		const script: string = typeof scriptData === 'string' ? scriptData : scriptData.script

		const compatabilityFileSystem = new CompatabilityFileSystem(fileSystem)

		const formatVersions = (await Data.get('/packages/minecraftBedrock/formatVersions.json')).formatVersions

		let fileJson: any = undefined

		if (filePath !== undefined) {
			try {
				fileJson = await fileSystem.readFileJson(filePath)
			} catch {}
		}

		const me = this

		try {
			this.runtime.clearCache()

			const runResult = await (
				await this.runtime.run(
					scriptPath,
					{
						readdir: (path: string) => {
							if (!me.fileSystemSchemaScripts.includes(scriptPath))
								me.fileSystemSchemaScripts.push(scriptPath)

							return compatabilityFileSystem.readdir.call(compatabilityFileSystem, path)
						},
						resolvePackPath(packId: string, path?: string) {
							if (!ProjectManager.currentProject) return ''

							return ProjectManager.currentProject.resolvePackPath(packId, path)
						},
						getFormatVersions() {
							return formatVersions
						},
						getCacheDataFor(fileType: string, filePath?: string, cacheKey?: string) {
							if (!me.indexerSchemaScripts.includes(scriptPath)) me.indexerSchemaScripts.push(scriptPath)

							return Promise.resolve(
								(ProjectManager.currentProject as BedrockProject).indexerService.getCachedData(
									fileType,
									filePath,
									cacheKey
								)
							)
						},
						getProjectConfig() {
							return ProjectManager.currentProject?.config
						},
						getProjectPrefix() {
							return ProjectManager.currentProject?.config?.namespace
						},
						getFileName() {
							if (!me.localSchemaScripts.includes(scriptPath)) me.localSchemaScripts.push(scriptPath)

							if (filePath === undefined) return undefined

							return basename(filePath)
						},
						uuid,
						get(path: string) {
							if (!me.fileSystemSchemaScripts.includes(scriptPath))
								me.fileSystemSchemaScripts.push(scriptPath)

							if (!me.localSchemaScripts.includes(scriptPath)) me.localSchemaScripts.push(scriptPath)

							if (fileJson === undefined) return []

							let data: string[] = []

							walkObject(path, fileJson, (value) => {
								data.push(value)
							})

							return data
						},
						customComponents(fileType: any) {
							return me.dashComponentsData.get(fileType)
						},
						getIndexedPaths(fileType: string, sort: boolean) {
							if (!me.indexerSchemaScripts.includes(scriptPath)) me.indexerSchemaScripts.push(scriptPath)

							if (!(ProjectManager.currentProject instanceof BedrockProject)) return Promise.resolve([])

							return Promise.resolve(ProjectManager.currentProject.indexerService.getIndexedFiles())
						},
						failedCurrentFileLoad: undefined,
					},
					`
			___module.execute = async function(){
				${script}
			}
		`
				)
			).execute()

			if (typeof scriptData === 'string') {
				scriptData = runResult
			} else {
				scriptData.data = runResult
			}

			return {
				data: scriptData,
				result: this.processScriptData(scriptData),
			}
		} catch (err) {
			console.error('Error running schema script ', scriptPath)
			console.error(err)

			return null
		}
	}

	private processScriptData(scriptData: any): any {
		if (scriptData === undefined) return undefined

		if (scriptData.type === 'enum') {
			return {
				type: 'string',
				enum: scriptData.data,
			}
		} else if (scriptData.type === 'properties') {
			return {
				type: 'object',
				properties: Object.fromEntries(scriptData.data.map((res: string) => [res, {}])),
			}
		} else if (scriptData.type === 'object') {
			return {
				type: 'object',
				properties: scriptData.data,
			}
		} else if (scriptData.type === 'custom') {
			return scriptData.data
		} else {
			console.warn('Unexpected script data type:', scriptData)
		}

		return undefined
	}
}
