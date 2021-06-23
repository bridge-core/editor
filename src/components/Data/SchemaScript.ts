import json5 from 'json5'
import { generateComponentSchemas } from '../Compiler/Worker/Plugins/CustomComponent/generateSchemas'
import { run } from '../Extensions/Scripts/run'
import { getFilteredFormatVersions } from './FormatVersions'
import { App } from '/@/App'
import { iterateDir } from '/@/utils/iterateDir'
import { walkObject } from '/@/utils/walkObject'
import { v4 as uuid } from 'uuid'

export class SchemaScript {
	constructor(protected app: App, protected filePath?: string) {}

	protected async runScript(script: string) {
		const scopedFs = this.app.project.fileSystem

		let currentJson = {}
		let failedFileLoad = true
		if (this.filePath) {
			const currentFile = await this.app.project.getFileFromDiskOrTab(
				this.filePath
			)

			try {
				currentJson = json5.parse(await currentFile.text())
				failedFileLoad = false
			} catch {}
		}

		try {
			return await run({
				async: true,
				script,
				env: {
					readdir: scopedFs.readFilesFromDir.bind(scopedFs),
					uuid,
					getFormatVersions: getFilteredFormatVersions,
					getCacheDataFor: async (
						fileType: string,
						filePath?: string,
						cacheKey?: string
					) => {
						const packIndexer = this.app.project.packIndexer

						return packIndexer.service!.getCacheDataFor(
							fileType,
							filePath,
							cacheKey
						)
					},
					getProjectPrefix: () =>
						this.app.projectConfig.get().namespace,
					getFileName: () =>
						!this.filePath
							? undefined
							: this.filePath.split(/\/|\\/g).pop(),
					customComponents: (fileType: string) =>
						generateComponentSchemas(fileType),
					get: (path: string) => {
						const data: any[] = []
						walkObject(path, currentJson, (d) => data.push(d))
						return data
					},
					failedCurrentFileLoad: failedFileLoad,
				},
			})
		} catch (err) {
			// console.error(`Error evaluating schemaScript: ${err.message}`)
		}
	}

	async runSchemaScripts(localSchemas: any) {
		const baseDirectory = await this.app.fileSystem.getDirectoryHandle(
			'data/packages/minecraftBedrock/schemaScript'
		)

		await iterateDir(baseDirectory, async (fileHandle) => {
			const file = await fileHandle.getFile()
			const fileText = await file.text()

			let schemaScript
			if (file.name.endsWith('.js')) schemaScript = { script: fileText }
			else schemaScript = json5.parse(fileText)

			let scriptResult: any = await this.runScript(schemaScript.script)
			if (file.name.endsWith('.js')) {
				if (scriptResult.keep) return

				schemaScript = {
					...schemaScript,
					type: scriptResult.type,
					generateFile: scriptResult.generateFile,
				}
				scriptResult = scriptResult.data
			}

			// if (
			// 	schemaScript.generateFile.startsWith(
			// 		'entity/dynamic/currentContext'
			// 	)
			// )
			// 	console.log(schemaScript, scriptResult)

			if (
				schemaScript.type === 'object' &&
				!Array.isArray(scriptResult) &&
				typeof scriptResult === 'object'
			) {
				localSchemas[
					`file:///data/packages/minecraftBedrock/schema/${schemaScript.generateFile}`
				] = {
					uri: `file:///data/packages/minecraftBedrock/schema/${schemaScript.generateFile}`,
					schema: {
						type: 'object',
						properties: scriptResult,
					},
				}
			} else {
				localSchemas[
					`file:///data/packages/minecraftBedrock/schema/${schemaScript.generateFile}`
				] = {
					uri: `file:///data/packages/minecraftBedrock/schema/${schemaScript.generateFile}`,
					schema: {
						type:
							schemaScript.type === 'enum' ? 'string' : 'object',
						enum:
							schemaScript.type === 'enum'
								? scriptResult
								: undefined,
						properties:
							schemaScript.type === 'properties'
								? Object.fromEntries(
										scriptResult.map((res: string) => [
											res,
											{},
										])
								  )
								: undefined,
					},
				}
			}
		})
	}
}
