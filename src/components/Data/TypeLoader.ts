import { App } from '/@/App'
import { IDisposable } from '/@/types/disposable'
import { DataLoader } from './DataLoader'
import { Tab } from '/@/components/TabSystem/CommonTab'
import { FileTab } from '/@/components/TabSystem/FileTab'
import {
	IRequirements,
	RequiresMatcher,
} from './RequiresMatcher/RequiresMatcher'
import { useMonaco } from '/@/utils/libs/useMonaco'
import { v4 as uuid } from 'uuid'

const types = new Map<string, string>()

export class TypeLoader {
	protected disposables: IDisposable[] = []
	protected typeDisposables: IDisposable[] = []
	protected userTypeDisposables: IDisposable[] = []
	protected currentTypeEnv: string | null = null

	constructor(protected dataLoader: DataLoader) {}

	async activate(filePath?: string) {
		this.disposables = <IDisposable[]>[
			App.eventSystem.on('currentTabSwitched', async (tab: Tab) => {
				if (!tab.isForeignFile && tab instanceof FileTab) {
					console.log('switch', tab.name)
					await this.setTypeEnv(tab.getPath())

					await this.loadUserTypes()
				}
			}),
		]
		if (filePath) await this.setTypeEnv(filePath)

		await this.loadUserTypes()
	}
	deactivate() {
		this.currentTypeEnv = null
		this.typeDisposables.forEach((disposable) => disposable.dispose())
		this.disposables.forEach((disposable) => disposable.dispose())
		this.typeDisposables = []
		this.disposables = []
	}

	protected async load(typeLocation: string, moduleName?: string) {
		console.time(`LOAD TYPES: ${typeLocation}`)
		// Check whether we have already loaded types
		let src = types.get(typeLocation)
		if (src)
			return <const>[
				typeLocation,
				this.wrapTypesInModule(src ?? '', moduleName),
			]

		// Decide whether the type is being loaded from data or needs to be fetched externally
		const isFromData = typeLocation.startsWith('types/')

		const originalTypeLocation = typeLocation

		if (isFromData) {
			await this.dataLoader.fired

			// Load types from file
			const file = await this.dataLoader.readFile(
				`data/packages/minecraftBedrock/${typeLocation}`
			)
			src = await file.text()
			types.set(typeLocation, this.wrapTypesInModule(src, moduleName))
		} else {
			const app = await App.getApp()

			// The cache index maps the urls to the files in cache
			let cacheIndex: Record<string, string> = {}
			try {
				cacheIndex = await app.fileSystem.readJSON(
					`~local/data/cache/types/index.json`
				)
			} catch {}

			// First check cache to see if we have already cached the file
			try {
				const cacheLocation = cacheIndex[typeLocation]
				if (cacheLocation) {
					typeLocation = `~local/data/cache/types/${cacheLocation}`

					const file = await app.fileSystem.readFile(typeLocation)
					src = await file.text()

					types.set(
						originalTypeLocation,
						this.wrapTypesInModule(src, moduleName)
					)
				} else throw {}
			} catch {
				// If we fail to get the types from cache, fetch them and save to cache
				const res = await fetch(typeLocation)
				const text = await res.text()

				const cacheFileName = `${uuid()}.d.ts`
				cacheIndex = {
					...cacheIndex,
					[typeLocation]: cacheFileName,
				}
				console.log('Write Cache', cacheFileName, typeLocation)
				typeLocation = `~local/data/cache/types/${cacheFileName}`

				await Promise.all([
					app.fileSystem.writeFile(typeLocation, text),
					app.fileSystem.writeJSON(
						'~local/data/cache/types/index.json',
						cacheIndex
					),
				])

				types.set(
					originalTypeLocation,
					this.wrapTypesInModule(text, moduleName)
				)
			}
		}
		console.timeEnd(`LOAD TYPES: ${originalTypeLocation}`)

		return <const>[
			typeLocation,
			this.wrapTypesInModule(src ?? '', moduleName),
		]
	}

	async setTypeEnv(filePath: string) {
		if (filePath === this.currentTypeEnv) return

		const { languages, Uri } = await useMonaco()

		this.currentTypeEnv = filePath
		this.typeDisposables.forEach((disposable) => disposable.dispose())
		this.typeDisposables = []

		await App.fileType.ready.fired
		const { types = [] } = App.fileType.get(filePath) ?? {}

		const matcher = new RequiresMatcher()
		await matcher.setup()

		const libs = await Promise.all(
			types.map(async (type) => {
				if (typeof type === 'string') return await this.load(type)

				// TODO - update mc-project-core FileType
				const { definition, requires, moduleName } = type as {
					definition: string
					moduleName?: string
					requires: IRequirements
				}

				const valid = !requires
					? true
					: matcher.isValid(requires as IRequirements)

				if (valid) return await this.load(definition, moduleName)
			})
		)
		const filteredLibs = <(readonly [string, string])[]>(
			libs.filter((lib) => lib !== undefined)
		)

		for (const [typePath, lib] of filteredLibs) {
			const uri = Uri.file(typePath)
			this.typeDisposables.push(
				languages.typescript.javascriptDefaults.addExtraLib(
					lib,
					uri.toString()
				),
				languages.typescript.typescriptDefaults.addExtraLib(
					lib,
					uri.toString()
				)
			)
		}
	}

	async loadUserTypes() {
		const app = await App.getApp()

		await app.project.packIndexer.fired
		let allFiles
		try {
			allFiles = await app.project.packIndexer.service.getAllFiles()
		} catch {
			// We failed to access the pack indexer service -> fail silently
			return
		}

		const typeScriptFiles = allFiles.filter(
			(filePath) => filePath.endsWith('.ts') || filePath.endsWith('.js')
		)

		const { languages, Uri } = await useMonaco()

		this.userTypeDisposables.forEach((disposable) => {
			disposable.dispose()
		})
		this.userTypeDisposables = []

		for (const typeScriptFile of typeScriptFiles) {
			const fileUri = Uri.file(typeScriptFile)
			const file = await app.fileSystem
				.readFile(typeScriptFile)
				.catch(() => null)
			if (!file) continue

			this.userTypeDisposables.push(
				languages.typescript.typescriptDefaults.addExtraLib(
					await file.text(),
					fileUri.toString()
				)
			)
		}
	}

	wrapTypesInModule(typeSrc: string, moduleName?: string) {
		if (!moduleName) return typeSrc

		return `declare module '${moduleName}' {\n${typeSrc}\n}`
	}
}
