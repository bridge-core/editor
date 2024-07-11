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
							return
						}

						// First check cache to see if we have already cached the file, if so resolve with the file from cache
						const cacheLocation = cacheIndex[typeLocation]
						const file = cacheLocation
							? await app.fileSystem
									.readFile(cacheLocation)
									.catch(() => null)
							: null

						// File is cached, so resolve with the file from cache
						if (file) {
							resolve([
								typeLocation,
								await file.text(),
								false,
								moduleName,
							])
							return
						}

						// The file couldn't be fetched from cache (because it is not in index or at the path specified)
						// So we need to fetch it
						const res = await fetch(typeLocation).catch(() => null)
						// TODO: Maybe set a variable (failedToFetchAtLeastOnce) to later open an information window that tells the user that some types couldn't be fetched

						// If the fetch failed, resolve with an empty string but don't cache it
						const text = res ? await res.text() : ''

						resolve([typeLocation, text, text !== '', moduleName])
					}
				)
			})
		)

		for (const [typeLocation, definition, updateCache] of toCache) {
			// First, save types to 'types' map
			types.set(typeLocation, definition)

			// Then if don't need to update cache, continue processing the next type
			if (!updateCache) continue

			// Create a random file name for the file to be stored in cache under. We can't use the location since it is a url and contains illegal file name characters
			const cacheFile = `~local/data/cache/types/${uuid()}.d.ts`
			cacheIndex = {
				...cacheIndex,
				[typeLocation]: cacheFile,
			}
			// Write the actual type definition in cache
			await app.fileSystem.writeFile(cacheFile, definition)
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

		let libDefinitions = types
			.map((type) => {
				if (typeof type === 'string') return [type]

				const { definition, requires, moduleName } = type

				if (!requires || matcher.isValid(requires as IRequirements))
					return [definition, moduleName]

				return []
			})
			.filter((type) => type[0]) as [string, string?][]

		if (libDefinitions.length === 0) {
			libDefinitions = types
				.map((type) => {
					if (typeof type === 'string') return [type]

					const { definition, requires, moduleName } = type

					return [definition, moduleName]
				})
				.filter((type) => type[0]) as [string, string?][]
		}

		const libs = await this.load(libDefinitions)

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
			const fileUri = Uri.file(
				// This for some reason fixes monaco suggesting the wrong path when using quickfixes. See issue #932
				typeScriptFile.replace('/BP/', '/bp/')
			)
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
