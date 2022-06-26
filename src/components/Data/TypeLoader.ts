import { App } from '/@/App'
import { IDisposable } from '/@/types/disposable'
import { languages, Uri } from 'monaco-editor'
import { DataLoader } from './DataLoader'
import { Tab } from '../TabSystem/CommonTab'
import { FileTab } from '../TabSystem/FileTab'
import {
	IRequirements,
	RequiresMatcher,
} from './RequiresMatcher/RequiresMatcher'

const types = new Map<string, string>()

export class TypeLoader {
	protected disposables: IDisposable[] = []
	protected typeDisposables: IDisposable[] = []
	protected currentTypeEnv: string | null = null

	constructor(protected dataLoader: DataLoader) {}

	async activate(filePath?: string) {
		this.disposables = <IDisposable[]>[
			App.eventSystem.on('currentTabSwitched', (tab: Tab) => {
				if (!tab.isForeignFile && tab instanceof FileTab)
					this.setTypeEnv(tab.getPath())
			}),
		]
		if (filePath) await this.setTypeEnv(filePath)
	}
	deactivate() {
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

		this.currentTypeEnv = filePath
		this.typeDisposables.forEach((disposable) => disposable.dispose())
		this.typeDisposables = []

		await App.fileType.ready.fired
		const { types = [] } = App.fileType.get(filePath) ?? {}

		const libs = await Promise.all(
			types.map(async (type) => {
				if (typeof type === 'string')
					return <const>[type, await this.load(type)]

				const { definition, requires } = type
				const matcher = new RequiresMatcher(requires as IRequirements)
				const valid = await matcher.isValid()

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
				// editor.createModel(lib, 'typescript', uri)
			)
		}
	}
}
