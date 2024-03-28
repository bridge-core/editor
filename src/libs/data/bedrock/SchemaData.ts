import { setSchemas } from '@/libs/monaco/Json'
import { Runtime } from '@/libs/runtime/Runtime'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { basename, dirname, join } from '@/libs/path'
import { CompatabilityFileSystem } from '@/libs/fileSystem/CompatabilityFileSystem'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { v4 as uuid } from 'uuid'
import { walkObject } from 'bridge-common-utils'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { Data } from '@/libs/data/Data'
import { Disposable, disposeAll } from '@/libs/disposeable/Disposeable'

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

export class SchemaData implements Disposable {
	private schemas: any = {}

	private schemaScripts: any = {}
	private dynamicSchemaScripts: string[] = []

	private staticGeneratedSchemas: any = {}

	private fileSchemas: {
		[key: string]: {
			main: string
			localSchemas: {
				[key: string]: any
			}
		}
	} = {}

	private runtime = new Runtime(fileSystem)

	private lightningCacheSchemas: Record<string, any> = {}

	private disposables: Disposable[] = []

	constructor(public project: BedrockProject) {}

	private fixPaths(schemas: { [key: string]: any }) {
		return Object.fromEntries(
			Object.entries(schemas).map(([path, schema]) => [path.substring('file:///'.length), schema])
		)
	}

	public async load() {
		this.disposables.push(this.project.indexerService.updated.on(this.indexerUpdated.bind(this)))

		this.indexerUpdated()

		this.schemas = {
			...this.fixPaths(await Data.get('packages/common/schemas.json')),
			...this.fixPaths(await Data.get('packages/minecraftBedrock/schemas.json')),
		}

		this.schemaScripts = this.fixPaths(await Data.get('packages/minecraftBedrock/schemaScripts.json'))

		await this.generateStaticGeneratedSchemas()
	}

	public dispose() {
		disposeAll(this.disposables)
	}

	private indexerUpdated() {
		for (const fileType of this.project.fileTypeData.fileTypes.map((fileType) => fileType.id)) {
			const chachedData = this.project.indexerService.getCachedData(fileType)

			if (chachedData === null) continue

			const collectedData = chachedData.reduce((accumulator: any, currentObject: any) => {
				for (const [key, value] of Object.entries(currentObject.data)) {
					accumulator[key] = (accumulator[key] ?? []).concat(value)
				}

				return accumulator
			}, {})

			const baseUrl = `data/packages/minecraftBedrock/schema/${fileType}/dynamic`

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

					if (reference.startsWith('#')) {
					} else if (reference.startsWith('/')) {
						references.push(reference.substring(1))

						reference = 'file:///' + join(basePath, reference.substring(1).split('#')[0])
					} else {
						references.push(join(dirname(schemaPath), reference.split('#')[0]))
					}

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

	public async applySchemaForFile(path: string, fileType?: string, schemaUri?: string) {
		if (schemaUri === undefined) {
			if (this.fileSchemas[path] !== undefined) delete this.fileSchemas[path]

			this.updateDefaults()

			return
		}

		if (schemaUri.startsWith('file:///')) schemaUri = schemaUri.substring('file:///'.length)

		const generatedDynamicSchemas: Record<string, any> = {}

		for (const scriptPath of this.dynamicSchemaScripts) {
			let scriptData = this.schemaScripts[scriptPath]

			const scriptResult = await this.runScript(
				scriptPath,
				typeof scriptData === 'string' ? scriptData : scriptData.script,
				path
			)

			if (typeof scriptData === 'string') {
				scriptData = scriptResult.result
			} else {
				scriptData.data = scriptResult.result
			}

			generatedDynamicSchemas[join('data/packages/minecraftBedrock/schema/', scriptData.generateFile)] =
				this.processScriptData(scriptData)
		}

		const contextLightningCacheSchemas: Record<string, any> = {}

		if (fileType) {
			const collectedData = this.project.indexerService.getCachedData(fileType, path)
			const baseUrl = `data/packages/minecraftBedrock/schema/${fileType}/dynamic`

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
				contextLightningCacheSchemas[schemaPathToRebase] ??
				this.lightningCacheSchemas[schemaPathToRebase] ??
				generatedDynamicSchemas[schemaPathToRebase] ??
				this.staticGeneratedSchemas[schemaPathToRebase] ??
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

			localSchemas[join(path, schemaPathToRebase)] = result.rebasedSchemaPart
		}

		this.fileSchemas[path] = {
			main: join(path, schemaUri),
			localSchemas,
		}

		this.updateDefaults()
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

	private async generateStaticGeneratedSchemas() {
		this.staticGeneratedSchemas = {}
		this.dynamicSchemaScripts = []

		const promises = []

		for (const scriptPath of Object.keys(this.schemaScripts)) {
			promises.push(this.generateStaticSchema(scriptPath, this.schemaScripts[scriptPath]))
		}

		await Promise.all(promises)
	}

	private async generateStaticSchema(scriptPath: string, scriptData: any) {
		const scriptResult = await this.runScript(
			scriptPath,
			typeof scriptData === 'string' ? scriptData : scriptData.script
		)

		if (scriptResult.dynamic) {
			this.dynamicSchemaScripts.push(scriptPath)

			return
		}

		if (typeof scriptData === 'string') {
			scriptData = scriptResult.result
		} else {
			scriptData.data = scriptResult.result
		}

		if (scriptData === undefined) return

		this.staticGeneratedSchemas[join('data/packages/minecraftBedrock/schema/', scriptData.generateFile)] =
			this.processScriptData(scriptData)
	}

	private processScriptData(scriptData: any): any {
		if (scriptData.type === 'enum') {
			return {
				type: 'string',
				enum: scriptData.data,
			}
		}

		return undefined
	}

	private async runScript(
		scriptPath: string,
		script: string,
		filePath?: string
	): Promise<{ dynamic: boolean; result?: any }> {
		const compatabilityFileSystem = new CompatabilityFileSystem(fileSystem)

		const formatVersions = (await Data.get('packages/minecraftBedrock/formatVersions.json')).formatVersions

		let dynamicSchema = false

		let invalidJson = true
		let fileJson: any = undefined

		if (filePath !== undefined) {
			try {
				fileJson = await fileSystem.readFileJson(filePath)

				invalidJson = false
			} catch {}
		}

		try {
			const result = await (
				await this.runtime.run(
					scriptPath,
					{
						readdir: compatabilityFileSystem.readdir.bind(compatabilityFileSystem),
						resolvePackPath(packId: string, path?: string) {
							if (!ProjectManager.currentProject) return ''

							return ProjectManager.currentProject.resolvePackPath(packId, path)
						},
						getFormatVersions() {
							return formatVersions
						},
						getCacheDataFor(fileType: string, filePath?: string, cacheKey?: string) {
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
							dynamicSchema = true

							if (filePath === undefined) return undefined

							return basename(filePath)
						},
						uuid,
						get(path: string) {
							dynamicSchema = true

							if (fileJson === undefined) return []

							let data: string[] = []

							walkObject(path, fileJson, data.push)

							return data
						},
						customComponents(fileType: any) {
							console.warn('To be implemented when custom components are implemented')

							return {}
						},
						getIndexedPaths(fileType: string, sort: boolean) {
							if (!(ProjectManager.currentProject instanceof BedrockProject)) return Promise.resolve([])

							return Promise.resolve(ProjectManager.currentProject.indexerService.getIndexedFiles())
						},
						failedCurrentFileLoad() {
							dynamicSchema = true

							return invalidJson
						},
					},
					`
				___module.execute = async function(){
					${script}
				}
			`
				)
			).execute()

			return {
				dynamic: dynamicSchema,
				result,
			}
		} catch (err) {
			console.error('Error running schema script ', scriptPath)
			console.error(err)

			return {
				dynamic: dynamicSchema,
			}
		}
	}
}
