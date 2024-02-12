import { data } from '@/App'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { Uri, languages } from 'monaco-editor'

export class ScriptTypeData {
	constructor(public project: BedrockProject) {}

	private typeDisposables: any[] = []

	public async load() {}

	public async applyTypesForFile(path: string, types: any[]) {
		for (const type of this.typeDisposables) {
			type.dispose()
		}

		const validTypes = types.filter((type) => {
			if (!type.requires) return true

			return this.project.requirementsMatcher.matches(type.requires)
		})

		const builtTypes = []

		for (const type of validTypes) {
			let location = typeof type === 'string' ? type : type.definition

			let content = null

			if (location.startsWith('types/')) {
				content = await data.getText(`data/packages/minecraftBedrock/${location}`)
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
}
