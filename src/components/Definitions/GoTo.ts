import { getLocation } from 'jsonc-parser'
import { Uri, Range, editor, Position, CancellationToken } from 'monaco-editor'
import { App } from '/@/App'
import { FileType, IDefinition } from '/@/components/Data/FileType'
import { getJsonWordAtPosition } from '/@/utils/monaco/getJsonWord'
import { isMatch } from 'micromatch'
import { ILightningInstruction } from '../PackIndexer/Worker/Main'

export class DefinitionProvider {
	async provideDefinition(
		model: editor.IModel,
		position: Position,
		cancellationToken: CancellationToken
	) {
		const app = await App.getApp()
		const { word, range } = getJsonWordAtPosition(model, position)
		const currentPath = app.project.tabSystem?.selectedTab?.getProjectPath()
		if (!currentPath) return

		const { definitions } = FileType.get(currentPath) ?? {}
		const lightningCache = await FileType.getLightningCache(currentPath)
		// lightningCache is string for lightning cache text scripts
		if (
			!definitions ||
			typeof lightningCache === 'string' ||
			lightningCache.length === 0
		)
			return

		const location = getLocation(
			model.getValue(),
			model.getOffsetAt(position)
		).path.join('/')

		const definitionId = this.getDefinition(location, lightningCache)
		if (!definitionId) return

		let definition = definitions[definitionId]
		if (!definition) return
		if (!Array.isArray(definition)) definition = [definition]

		const projectName = app.project.name
		const connectedFiles = await this.getFilePath(word, definition)

		return await Promise.all(
			connectedFiles.map(async (file) => {
				const filePath = `projects/${projectName}/${file}`
				const uri = Uri.file(filePath)

				if (!editor.getModel(uri)) {
					const fileHandle = await app.fileSystem.getFileHandle(
						filePath
					)
					const model = editor.createModel(
						await fileHandle.getFile().then((file) => file.text()),
						undefined,
						uri
					)

					// Try to remove model after 5 seconds
					setTimeout(() => {
						// Model is not in use
						if (!app.project.getFileTab(fileHandle)) {
							model.dispose()
						}
					}, 5 * 1000)
				}

				return {
					uri,
					range: new Range(0, 0, Infinity, Infinity),
				}
			})
		)
	}

	getDefinition(location: string, lightningCache: ILightningInstruction[]) {
		const definitions = lightningCache.map((def) => {
			const firstValidKey = Object.keys(def).find(
				(key) => !key.startsWith('@')
			)
			if (!firstValidKey)
				throw new Error(
					`Invalid lightning cache definition: Missing definition key and/or path pair`
				)

			// def[firstValidKey] may not be undefined for valid lightning cache files
			return <const>[firstValidKey, def[firstValidKey]!]
		})

		return definitions.find(([def, path]) => isMatch(location, path))?.[0]
	}

	async getFilePath(word: string, definition: IDefinition[]) {
		const app = await App.getApp()
		const connectedFiles = []

		for (const def of definition) {
			// Direct references are e.g. loot table paths
			if (def.directReference) {
				connectedFiles.push(word)
				continue
			}

			const matches =
				(await app.project.packIndexer.service?.find(
					def.from,
					def.match,
					[word]
				)) ?? []

			connectedFiles.push(...matches)
		}

		return connectedFiles
	}
}
