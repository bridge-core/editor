import { App } from '@/App'
import { FileType, IMonacoSchemaArrayEntry } from '@/components/Data/FileType'
import { whenIdle } from '@/utils/whenIdle'
import json5 from 'json5'
import * as monaco from 'monaco-editor'
import { runAsync } from '../Extensions/Scripts/run'
import { FileSystem } from '../FileSystem/Main'
import { selectedProject } from '../Project/Loader'

export namespace JSONDefaults {
	let schemas: Record<string, IMonacoSchemaArrayEntry> = {}

	export function addSchemas(
		addSchemas: IMonacoSchemaArrayEntry[],
		updateMonaco = true
	) {
		// console.log(addSchemas)
		addSchemas.forEach(addSchema => {
			if (schemas[addSchema.uri]) {
				if (addSchema.schema)
					schemas[addSchema.uri].schema = addSchema.schema
				if (addSchema.fileMatch)
					schemas[addSchema.uri].fileMatch = addSchema.fileMatch
			} else schemas[addSchema.uri] = addSchema
		})

		if (updateMonaco) setJSONDefaults()
	}

	function requestSchemaFor(fileType: string, fromFilePath?: string) {
		return new Promise<IMonacoSchemaArrayEntry[]>(async resolve => {
			const app = await App.getApp()
			app.packIndexer.once(async () => {
				resolve(
					await app.packIndexer.service.getSchemasFor(
						fileType,
						fromFilePath
					)
				)
			})
		})
	}
	async function getDynamicSchemas() {
		return (
			await Promise.all(FileType.getIds().map(id => requestSchemaFor(id)))
		).flat()
	}
	async function loadStaticSchemas(
		directoryHandle: FileSystemDirectoryHandle,
		fromPath = 'data/packages/schema'
	) {
		const promises: Promise<void>[] = []
		for await (const [name, entry] of directoryHandle.entries()) {
			const currentPath = `${fromPath}/${name}`
			if (entry.name === '.DS_Store') continue

			if (entry.kind === 'file') {
				schemas[`file:///${currentPath}`] = {
					uri: `file:///${currentPath}`,
					schema: await entry
						.getFile()
						.then(file => file.text())
						.then(json5.parse),
				}
			} else {
				promises.push(loadStaticSchemas(entry, currentPath))
			}
		}

		await Promise.all(promises)
	}
	async function runSchemaScripts(fileSystem: FileSystem) {
		const baseDirectory = await fileSystem.getDirectoryHandle(
			'data/packages/schemaScript'
		)
		const scopedFs = new FileSystem(
			await fileSystem.getDirectoryHandle(`projects/${selectedProject}`)
		)

		for await (const dirent of baseDirectory.values()) {
			if (dirent.kind !== 'file' || dirent.name === '.DS_Store') continue

			const file = await dirent.getFile()
			const schemaScript = json5.parse(await file.text())

			let scriptResult: string[] = []
			try {
				scriptResult = await runAsync(
					schemaScript.script,
					[scopedFs.readFilesFromDir.bind(scopedFs)],
					['readdir']
				)
			} catch {}

			console.log(scriptResult)

			schemas[
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

	async function loadAllSchemas() {
		schemas = {}
		const app = await App.getApp()
		console.time('[JSON DEFAULTS] Static schemas')
		try {
			await loadStaticSchemas(
				await app.fileSystem.getDirectoryHandle('data/packages/schema')
			)
		} catch {
			return
		}
		console.timeEnd('[JSON DEFAULTS] Static schemas')

		console.time('[JSON DEFAULTS] Adding matchers to schemas')
		addSchemas(FileType.getMonacoSchemaArray(), false)
		console.timeEnd('[JSON DEFAULTS] Adding matchers to schemas')
		console.time('[JSON DEFAULTS] Dynamic schemas')
		addSchemas(await getDynamicSchemas(), false)
		await runSchemaScripts(app.fileSystem)
		console.timeEnd('[JSON DEFAULTS] Dynamic schemas')
		setJSONDefaults()
	}

	function setJSONDefaults() {
		monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
			enableSchemaRequest: false,
			allowComments: true,
			validate: true,
			schemas: Object.values(schemas),
		})
	}

	export function setup() {
		App.ready.once(app => {
			app.packIndexer.on(() =>
				whenIdle(async () => {
					console.time('[EDITOR] Setting up JSON defaults')

					await loadAllSchemas()

					console.timeEnd('[EDITOR] Setting up JSON defaults')
				})
			)

			app.actionManager.create({
				icon: 'mdi-reload',
				name: 'Reload Auto-Completions',
				description: 'Reloads all auto-completion data',
				keyBinding: 'Ctrl + Shift + R',
				onTrigger: () => reload(),
			})
		})

		App.eventSystem.on('fileUpdated', async filePath => {
			const fileType = FileType.getId(filePath)
			const app = await App.getApp()
			addSchemas(await requestSchemaFor(fileType))
			await runSchemaScripts(app.fileSystem)
		})

		// Updating currentContext/ references
		App.eventSystem.on('currentTabSwitched', async filePath => {
			// console.log(filePath)
			const fileType = FileType.getId(filePath)
			addSchemas(await requestSchemaFor(fileType, filePath))
		})
		App.eventSystem.on('refreshCurrentContext', async filePath => {
			// console.log(filePath)
			const fileType = FileType.getId(filePath)
			addSchemas(await requestSchemaFor(fileType, filePath))
		})
	}

	export async function reload() {
		const app = await App.getApp()

		app.windows.loadingWindow.open()
		await loadAllSchemas()
		app.windows.loadingWindow.close()
	}
}
