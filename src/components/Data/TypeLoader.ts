import { FileType } from './FileType'
import { App } from '/@/App'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { IDisposable } from '/@/types/disposable'
import { languages, editor, Uri } from 'monaco-editor'
const types = new Map<string, string>()

export class TypeLoader {
	protected disposables: IDisposable[] = []
	protected typeDisposables: IDisposable[] = []
	protected currentTypeEnv: string | null = null

	constructor(protected fileSystem: FileSystem) {}

	activate() {
		this.disposables = <IDisposable[]>[
			App.eventSystem.on('currentTabSwitched', (filePath: string) =>
				this.setTypeEnv(filePath)
			),
		]
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
		const file = await this.fileSystem.readFile(`data/packages/${typePath}`)
		src = await file.text()
		types.set(typePath, src)

		return src
	}

	async setTypeEnv(filePath: string) {
		if (filePath === this.currentTypeEnv) return

		this.currentTypeEnv = filePath
		this.typeDisposables.forEach((disposable) => disposable.dispose())
		this.typeDisposables = []

		const { types = [] } = FileType.get(filePath) ?? {}

		const libs = await Promise.all(
			types.map(async (type) => <const>[type, await this.load(type)])
		)

		for (const [typePath, lib] of libs) {
			const uri = Uri.file(typePath)
			this.typeDisposables.push(
				languages.typescript.javascriptDefaults.addExtraLib(
					lib,
					uri.toString()
				)
			)
		}
	}
}
