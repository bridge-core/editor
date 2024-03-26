import { BedrockProject } from '@/libs/project/BedrockProject'
import { Uri, languages } from 'monaco-editor'
import { Data } from '@/libs/data/Data'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { Disposable } from '@/libs/disposeable/Disposeable'

export class ScriptTypeData implements Disposable {
	constructor(public project: BedrockProject) {}

	private typeDisposables: any[] = []

	private appliedTypes: any[] = []

	public async setup() {
		fileSystem.eventSystem.on('pathUpdated', this.pathUpdated.bind(this))
	}

	public async dispose() {
		fileSystem.eventSystem.off('pathUpdated', this.pathUpdated)
	}

	public async applyTypes(types: any[]) {
		for (const type of this.typeDisposables) {
			type.dispose()
		}

		this.appliedTypes = types

		const behaviorPackPath = this.project.resolvePackPath('behaviorPack', 'manifest.json')
		let behaviourManifest = {}

		if (this.project.packs['behaviorPack'] && (await fileSystem.exists(behaviorPackPath))) {
			try {
				behaviourManifest = await fileSystem.readFileJson(behaviorPackPath)
			} catch {}
		}

		const validTypes = types.filter((type) => {
			if (!type.requires) return true

			return this.project.requirementsMatcher.matches(type.requires, behaviourManifest)
		})

		const builtTypes = []

		for (const type of validTypes) {
			let location = typeof type === 'string' ? type : type.definition

			let content = null

			if (location.startsWith('types/')) {
				content = await Data.getText(`packages/minecraftBedrock/${location}`)
			} else {
				const result = await fetch(location).catch(() => null)

				if (!result) continue

				content = await result.text()

				location = location.substring('https://'.length)
			}

			if (type.moduleName) content = `declare module '${type.moduleName}' {\n${content}\n}`

			builtTypes.push({
				location,
				content,
			})
		}

		for (const builtType of builtTypes) {
			const uri = Uri.file(builtType.location)

			this.typeDisposables.push(
				languages.typescript.javascriptDefaults.addExtraLib(builtType.content, uri.toString())
			)

			this.typeDisposables.push(
				languages.typescript.typescriptDefaults.addExtraLib(builtType.content, uri.toString())
			)
		}
	}

	private async pathUpdated(path: unknown) {
		if (typeof path !== 'string') return

		const behaviorPackPath = this.project.resolvePackPath('behaviorPack', 'manifest.json')

		if (path !== behaviorPackPath) return

		this.applyTypes(this.appliedTypes)
	}
}
