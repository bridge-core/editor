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

/**
 * A map of type locations to type defintions that have been loaded
 */
const types = new Map<string, string>()

export class TypeLoader {
	protected disposables: IDisposable[] = []
	protected typeDisposables: IDisposable[] = []
	protected userTypeDisposables: IDisposable[] = []
	protected currentTypeEnv: string | null = null
	protected isLoading: boolean = false

	constructor(protected dataLoader: DataLoader) {}

	async activate(filePath?: string) {
		this.disposables = <IDisposable[]>[
			App.eventSystem.on('currentTabSwitched', async (tab: Tab) => {
				if (!tab.isForeignFile && tab instanceof FileTab) {
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

	protected async load(typeLocations: [string, string?][]) {
		// Ignore if we are already loading types (e.g. if a tab has been switched while loading)
		if (this.isLoading) return []
		this.isLoading = true

		const app = await App.getApp()

		// Load the cache index which maps the urls to the location of the files in cache
		let cacheIndex: Record<string, string> = {}
		try {
			cacheIndex = await app.fileSystem.readJSON(
				`~local/data/cache/types/index.json`
			)
		} catch {}

		// Create promises for loading each type definition. Once this resolves, the types will be cached appropriately
		const toCache = await Promise.all(
			typeLocations.map(([typeLocation, moduleName]) => {
				return new Promise<[string, string, boolean, string?]>(
					async (resolve) => {
						// Before we try to load anything, make sure the type definition hasn't already been loaded and set in the type map
						let src = types.get(typeLocation)
						if (src) resolve([typeLocation, src, false, moduleName])

						// Decide whether the type is being loaded from data or needs to be fetched externally
						const isFromData = typeLocation.startsWith('types/')
						if (isFromData) {
							// Load types directly from bridge.'s data
							await this.dataLoader.fired

							const file = await this.dataLoader.readFile(
								`data/packages/minecraftBedrock/${typeLocation}`
							)
							src = await file.text()
							resolve([typeLocation, src, false, moduleName])
						} else {
							// First check cache to see if we have already cached the file, if so resolve with the file from cache
							try {
								const cacheLocation = cacheIndex[typeLocation]
								if (cacheLocation) {
									const file = await app.fileSystem.readFile(
										cacheLocation
									)
									src = await file.text()

									resolve([
										typeLocation,
										src,
										false,
										moduleName,
									])
								} else throw {}
							} catch {
								// The file couldn't be fetched from cache (because it is not in index or at the path specified)
								// So we need to fetch it
								const res = await fetch(typeLocation)
								const text = await res.text()

								resolve([typeLocation, text, true, moduleName])
							}
						}
					}
				)
			})
		)

		for (const [typeLocation, definition, updateCache] of toCache) {
			// First, save types to 'types' map
			types.set(typeLocation, definition)

			// Then if we need to, update the cache index
			if (updateCache) {
				// Create a random file name for the file to be stored in cache under. We can't use the location since it is a url and contains illegal file name characters
				const cacheFile = `~local/data/cache/types/${uuid()}.d.ts`
				cacheIndex = {
					...cacheIndex,
					[typeLocation]: cacheFile,
				}
				// Write the actual type definition in cache
				await app.fileSystem.writeFile(cacheFile, definition)
			}
		}

		// Update the cache index
		await app.fileSystem.writeJSON(
			'~local/data/cache/types/index.json',
			cacheIndex
		)

		this.isLoading = false

		return toCache.map(
			([typeLocation, definition, updateCache, moduleName]) => [
				typeLocation,
				this.wrapTypesInModule(definition, moduleName),
			]
		)
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

		const libs = await this.load(
			types
				.map((type) => {
					if (typeof type === 'string') return [type]

					// TODO - update mc-project-core FileType
					const { definition, requires, moduleName } = type as {
						definition: string
						moduleName?: string
						requires: IRequirements
					}

					if (!requires || matcher.isValid(requires as IRequirements))
						return [definition, moduleName]

					return []
				})
				.filter((type) => type[0]) as [string, string?][]
		)

		for (const [typePath, lib] of libs) {
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
