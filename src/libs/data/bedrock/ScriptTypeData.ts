import { BedrockProject } from '@/libs/project/BedrockProject'
import { IDisposable, Uri, languages } from 'monaco-editor'
import { Data } from '@/libs/data/Data'
import { fileSystem, iterateDirectory } from '@/libs/fileSystem/FileSystem'
import { Disposable, disposeAll } from '@/libs/disposeable/Disposeable'

/**
 * Attempts to detect the valid scripting types for the project and apply them to the monaco completions.
 */
export class ScriptTypeData implements Disposable {
	constructor(public project: BedrockProject) {}

	private typeDisposables: IDisposable[] = []

	private appliedTypes: any[] = []

	private disposables: Disposable[] = []

	public async setup() {
		this.disposables.push(fileSystem.pathUpdated.on(this.pathUpdated.bind(this)))
	}

	public async dispose() {
		for (const type of this.typeDisposables) {
			type.dispose()
		}
		disposeAll(this.disposables)
	}

	public async applyTypes(types: any[]) {
		for (const type of this.typeDisposables) {
			type.dispose()
		}

		this.appliedTypes = types

		let builtTypes: any[] = []
		builtTypes = builtTypes.concat(await this.buildManifestModuleTypes(types), await this.buildUserScriptTypes())

		for (const builtType of builtTypes) {
			const uri = Uri.file(builtType.location)

			this.typeDisposables.push(languages.typescript.javascriptDefaults.addExtraLib(builtType.content, uri.toString()))

			this.typeDisposables.push(languages.typescript.typescriptDefaults.addExtraLib(builtType.content, uri.toString()))
		}
	}

	private async buildManifestModuleTypes(types: any[]): Promise<any[]> {
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

		return builtTypes
	}

	private async buildUserScriptTypes(): Promise<any[]> {
		const scriptsPath = this.project.resolvePackPath('behaviorPack', 'scripts')

		const scriptsPathExists = await fileSystem.exists(scriptsPath)
		if (!scriptsPathExists) return []

		const builtTypes: any[] = []

		await iterateDirectory(fileSystem, scriptsPath, async (entry) => {
			const location = entry.path
			const content = await fileSystem.readFileText(entry.path)

			builtTypes.push({
				location,
				content,
			})
		})

		return builtTypes
	}

	private async pathUpdated(path: unknown) {
		if (typeof path !== 'string') return

		const manifestPath = this.project.resolvePackPath('behaviorPack', 'manifest.json')

		if (path !== manifestPath) return

		this.applyTypes(this.appliedTypes)
	}
}
