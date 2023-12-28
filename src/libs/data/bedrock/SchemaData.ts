import { setSchemas } from '@/libs/monaco/Json'
import { Runtime } from '@/libs/runtime/Runtime'
import { data, fileSystem, projectManager } from '@/App'
import { join } from '@/libs/path'
import { CompatabilityFileSystem } from '@/libs/fileSystem/CompatabilityFileSystem'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { v4 as uuid } from 'uuid'

export class SchemaData {
	private schemas: any = {}
	private generatedSchemas: any = {}
	private dynamicSchemas: string[] = []
	private generatedDynamicSchemas: { [key: string]: any } = {}
	private schemaUsers: { [key: string]: string[] } = {}
	private schemaScripts: any = {}
	private runtime = new Runtime()

	public async load() {
		this.schemas = {
			...(await data.get('packages/common/schemas.json')),
			...(await data.get('packages/minecraftBedrock/schemas.json')),
		}

		this.schemaScripts = await data.get(
			'packages/minecraftBedrock/schemaScripts.json'
		)

		await this.runScripts()
	}

	public get(path: string): any | null {
		return this.schemas[path] ?? null
	}

	public loadDynamicSchemas(path: string, schemaUri: string) {
		if (this.schemaUsers[schemaUri] === undefined)
			this.schemaUsers[schemaUri] = []

		if (!this.schemaUsers[schemaUri].includes(path))
			this.schemaUsers[schemaUri].push(path)

		// generate dynamic schemas for this file
		console.log(this.dynamicSchemas)

		setSchemas([
			...Object.keys(this.schemas).map((schema) => ({
				uri: schema,
				fileMatch: this.schemaUsers[schema],
				schema: this.schemas[schema],
			})),
			...Object.keys({ ...this.generatedSchemas }).map((schema) => ({
				uri: schema,
				schema: this.generatedSchemas[schema],
			})),
		])
	}

	private async runScripts() {
		const promises = []

		for (const scriptPath of Object.keys(this.schemaScripts)) {
			let scriptData =
				typeof this.schemaScripts[scriptPath] === 'string'
					? {
							script: this.schemaScripts[scriptPath],
							generatesData: true,
					  }
					: this.schemaScripts[scriptPath]

			promises.push(this.runScript(scriptPath, scriptData))
		}

		await Promise.all(promises)

		setSchemas([
			...Object.keys(this.schemas).map((schema) => ({
				uri: schema,
				schema: this.schemas[schema],
			})),
			...Object.keys({ ...this.generatedSchemas }).map((schema) => ({
				uri: schema,
				schema: this.generatedSchemas[schema],
			})),
		])
	}

	private async runScript(scriptPath: string, scriptData: any) {
		const compatabilityFileSystem = new CompatabilityFileSystem(fileSystem)

		const formatVersions = (
			await data.get('packages/minecraftBedrock/formatVersions.json')
		).formatVersions

		let dynamicSchema = false

		try {
			const result = await (
				await this.runtime.run(
					scriptPath,
					{
						readdir: compatabilityFileSystem.readdir.bind(
							compatabilityFileSystem
						),
						resolvePackPath(packId: string, path: string) {
							return join(
								projectManager.currentProject?.path ?? '',
								'RP',
								path
							)
						},
						getFormatVersions() {
							return formatVersions
						},
						getCacheDataFor(
							fileType: string,
							filePath?: string,
							cacheKey?: string
						) {
							return (
								projectManager.currentProject as BedrockProject
							).indexerService.getCachedData(
								fileType,
								filePath,
								cacheKey
							)
						},
						getProjectConfig() {
							return projectManager.currentProject?.config
						},
						getProjectPrefix() {
							return projectManager.currentProject?.config
								?.namespace
						},
						getFileName() {
							dynamicSchema = true
							console.warn('Not implemented yet!')
							return undefined
						},
						uuid,
						get(path: string) {
							dynamicSchema = true
							console.warn('Not Implemented yet!')
							return []
						},
						customComponents(fileType: any) {
							console.warn('Not Implemented yet!')
							return {}
						},
						getIndexedPaths(fileType: string, sort: boolean) {
							console.warn('Not Implemented yet!')
							return Promise.resolve([])
						},
						failedCurrentFileLoad() {
							dynamicSchema = true

							return false
						},
					},
					`
				___module.execute = async function(){
					${scriptData.script}
				}
			`
				)
			).execute()

			if (scriptData.generatesData) scriptData = result

			if (scriptData.type === 'enum') {
				this.generatedSchemas[
					'file:///' +
						join(
							'data/packages/minecraftBedrock/schema/',
							scriptData.generateFile
						)
				] = {
					type: 'string',
					enum: result,
				}
			}

			if (dynamicSchema)
				console.log('Dynamic schema', scriptPath, scriptData)
		} catch (err) {
			console.error('Error running schema script ', scriptPath)
			console.error(err)
		}

		if (dynamicSchema && !this.dynamicSchemas.includes(scriptPath))
			this.dynamicSchemas.push(scriptPath)
	}
}
