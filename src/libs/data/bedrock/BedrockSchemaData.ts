import { setSchemas } from '@/libs/monaco/Json'
import { Data } from '../Data'
import { Runtime } from '@/libs/runtime/Runtime'
import { fileSystem, projectManager } from '@/App'
import { basename, join } from '@/libs/path'
import { CompatabilityFileSystem } from '@/libs/fileSystem/CompatabilityFileSystem'

export class BedrockSchemaData {
	private schemas: any = {}
	private dynamicSchemas: any = {}
	private schemaScripts: any = {}
	private runtime = new Runtime()

	public async load(data: Data) {
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

	public applySchema(path: string, schemaUri: string) {
		setSchemas([
			...Object.keys(this.schemas).map((schema) => ({
				uri: schema,
				fileMatch: schema === schemaUri ? [path] : undefined,
				schema: this.schemas[schema],
			})),
			...Object.keys({ ...this.dynamicSchemas }).map((schema) => ({
				uri: schema,
				schema: this.dynamicSchemas[schema],
			})),
		])
	}

	public releaseSchema() {
		setSchemas([
			...Object.keys(this.schemas).map((schema) => ({
				uri: schema,
				schema: this.schemas[schema],
			})),
			...Object.keys({ ...this.dynamicSchemas }).map((schema) => ({
				uri: schema,
				schema: this.dynamicSchemas[schema],
			})),
		])
	}

	private async runScripts() {
		const promises = []

		for (const scriptPath of Object.keys(this.schemaScripts)) {
			if (
				scriptPath !==
				'file:///data/packages/minecraftBedrock/schemaScript/lang/langPath.json'
			)
				continue

			let scriptData =
				typeof this.schemaScripts[scriptPath] === 'string'
					? { script: this.schemaScripts[scriptPath] }
					: this.schemaScripts[scriptPath]

			promises.push(this.runScript(scriptPath, scriptData))
		}

		await Promise.all(promises)

		setSchemas([
			...Object.keys(this.schemas).map((schema) => ({
				uri: schema,
				schema: this.schemas[schema],
			})),
			...Object.keys({ ...this.dynamicSchemas }).map((schema) => ({
				uri: schema,
				schema: this.dynamicSchemas[schema],
			})),
		])
	}

	private async runScript(scriptPath: string, scriptData: any) {
		const compatabilityFileSystem = new CompatabilityFileSystem(fileSystem)

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
				},
				`
			___module.execute = async function(){
				${scriptData.script}
			}
		`
			)
		).execute()

		if (scriptData.type === 'enum') {
			this.dynamicSchemas[
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
	}
}
