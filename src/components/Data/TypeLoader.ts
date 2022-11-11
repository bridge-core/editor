import { App } from '/@/App'
import { IDisposable } from '/@/types/disposable'
import { DataLoader } from './DataLoader'
import { Tab } from '../TabSystem/CommonTab'
import { FileTab } from '../TabSystem/FileTab'
import {
	IRequirements,
	RequiresMatcher,
} from './RequiresMatcher/RequiresMatcher'
import { useMonaco } from '/@/utils/libs/useMonaco'

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

	protected async load(typePath: string) {
		// Check whether we have already loaded types
		let src = types.get(typePath)
		if (src) return src

		await this.dataLoader.fired

		// Load types from file
		const file = await this.dataLoader.readFile(
			`data/packages/minecraftBedrock/${typePath}`
		)
		src = await file.text()
		types.set(typePath, src)

		return src
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
				if (typeof type === 'string')
					return <const>[type, await this.load(type)]

				const { definition, requires } = type

				const valid = !requires
					? true
					: matcher.isValid(requires as IRequirements)

				if (valid)
					return <const>[definition, await this.load(definition)]
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
}
