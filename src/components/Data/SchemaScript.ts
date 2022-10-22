import json5 from 'json5'
import { run } from '../Extensions/Scripts/run'
import { getFilteredFormatVersions } from './FormatVersions'
import { App } from '/@/App'
import { walkObject } from 'bridge-common-utils'
import { v4 as uuid } from 'uuid'
import { compareVersions } from 'bridge-common-utils'
import { TPackTypeId } from './PackType'
import type { JsonDefaults } from './JSONDefaults'
import { TComponentFileType } from '../Compiler/Worker/Plugins/CustomComponent/ComponentSchemas'

export class SchemaScript {
	constructor(
		protected jsonDefaults: JsonDefaults,
		protected app: App,
		protected filePath?: string
	) {}

	protected async runScript(scriptPath: string, script: string) {
		const fs = this.app.fileSystem

		let currentJson = {}
		let failedFileLoad = true
		if (this.filePath) {
			try {
				const currentFile = await this.app.project.getFileFromDiskOrTab(
					this.filePath
				)

				currentJson = json5.parse(await currentFile.text())
				failedFileLoad = false
			} catch {}
		}

		try {
			return await run({
				async: true,
				script,
				env: {
					readdir: (path: string) =>
						fs.readFilesFromDir(path).catch(() => []),
					uuid,
					getFormatVersions: getFilteredFormatVersions,
					getCacheDataFor: async (
						fileType: string,
						filePath?: string,
						cacheKey?: string
					) => {
						const packIndexer = this.app.project.packIndexer
						await packIndexer.fired

						return packIndexer.service.getCacheDataFor(
							fileType,
							filePath,
							cacheKey
						)
					},
					getIndexedPaths: async (
						fileType?: string,
						sort?: boolean
					) => {
						const packIndexer = this.app.project.packIndexer
						await packIndexer.fired

						const paths = await packIndexer.service.getAllFiles(
							fileType,
							sort
						)
						return paths
					},
					getProjectPrefix: () =>
						this.app.projectConfig.get().namespace ?? 'bridge',
					getProjectConfig: () => this.app.projectConfig.get(),
					getFileName: () =>
						!this.filePath
							? undefined
							: this.filePath.split(/\/|\\/g).pop(),
					customComponents: (fileType: TComponentFileType) =>
						this.jsonDefaults.componentSchemas.get(fileType),
					get: (path: string) => {
						const data: any[] = []
						walkObject(path, currentJson, (d) => data.push(d))
						return data
					},
					compare: compareVersions,
					resolvePackPath: (
						packId?: TPackTypeId,
						filePath?: string
					) =>
						this.app.projectConfig.resolvePackPath(
							packId,
							filePath
						),
					failedCurrentFileLoad: failedFileLoad,
				},
			})
		} catch (err: any) {
			console.error(
				`Error evaluating schemaScript "${scriptPath}": ${err.message}`
			)
		}
	}

	async runSchemaScripts(localSchemas: any) {
		const schemaScripts = await this.app.dataLoader.readJSON(
			'data/packages/minecraftBedrock/schemaScripts.json'
		)

		for (const [scriptPath, script] of Object.entries(schemaScripts)) {
			let schemaScript: any
			if (scriptPath.endsWith('.js')) schemaScript = { script }
			else schemaScript = script

			let scriptResult: any = await this.runScript(
				scriptPath,
				schemaScript.script
			)

			if (scriptResult) {
				if (scriptPath.endsWith('.js')) {
					if (scriptResult.keep) continue

					schemaScript = {
						...schemaScript,
						type: scriptResult.type,
						generateFile: scriptResult.generateFile,
					}
					scriptResult = scriptResult.data
				}

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
				} else if (schemaScript.type === 'custom') {
					localSchemas[
						`file:///data/packages/minecraftBedrock/schema/${schemaScript.generateFile}`
					] = {
						uri: `file:///data/packages/minecraftBedrock/schema/${schemaScript.generateFile}`,
						schema: scriptResult,
					}
				} else {
					localSchemas[
						`file:///data/packages/minecraftBedrock/schema/${schemaScript.generateFile}`
					] = {
						uri: `file:///data/packages/minecraftBedrock/schema/${schemaScript.generateFile}`,
						schema: {
							type:
								schemaScript.type === 'enum'
									? 'string'
									: 'object',
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
			}
		}
	}
}
