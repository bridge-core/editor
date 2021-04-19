import { FileType } from './FileType'
import { App } from '/@/App'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { IDisposable } from '/@/types/disposable'
import { editor, languages, Uri } from 'monaco-editor'
import { compare, CompareOperator } from 'compare-versions'
const types = new Map<string, string>()

export class TypeLoader {
	protected disposables: IDisposable[] = []
	protected typeDisposables: IDisposable[] = []
	protected currentTypeEnv: string | null = null

	constructor(protected fileSystem: FileSystem) {}

	async activate(filePath?: string) {
		this.disposables = <IDisposable[]>[
			App.eventSystem.on('currentTabSwitched', (filePath: string) =>
				this.setTypeEnv(filePath)
			),
		]
		if (filePath) await this.setTypeEnv(filePath)
	}
	deactivate() {
		this.typeDisposables.forEach((disposable) => disposable.dispose())
		this.disposables.forEach((disposable) => disposable.dispose())
		this.typeDisposables = []
		this.disposables = []
	}

	async load(typePath: string) {
		// Check whether we have already loaded types
		let src = types.get(typePath)
		if (src) return src

		// Load types from file
		const file = await this.fileSystem.readFile(
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

		await FileType.ready.fired
		const { types = [] } = FileType.get(filePath) ?? {}

		const libs = await Promise.all(
			types.map(async (type) => {
				if (typeof type === 'string')
					return <const>[type, await this.load(type)]

				const app = await App.getApp()
				const [
					typePath,
					{
						targetVersion: [operator, targetVersion],
					},
				] = type
				const projectTargetVersion = await app.projectConfig.get(
					'targetVersion'
				)

				if (compare(projectTargetVersion, targetVersion, operator))
					return <const>[typePath, await this.load(typePath)]
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
				),
				editor.createModel(lib, 'typescript', uri)
			)
		}
	}
}
