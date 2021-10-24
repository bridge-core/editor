import { getLocation } from '/@/utils/monaco/getLocation'
import { Uri, Range, editor, Position, CancellationToken } from 'monaco-editor'
import { App } from '/@/App'
import { IDefinition } from '/@/components/Data/FileType'
import { getJsonWordAtPosition } from '/@/utils/monaco/getJsonWord'
import { ILightningInstruction } from '/@/components/PackIndexer/Worker/Main'
import { run } from '/@/components/Extensions/Scripts/run'
import { findFileExtension } from '/@/components/FileSystem/FindFile'
import { findAsync } from '/@/utils/array/findAsync'
import { AnyFileHandle } from '../FileSystem/Types'
import { isMatch } from '/@/utils/glob/isMatch'

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

		const { definitions } = App.fileType.get(currentPath) ?? {}
		const lightningCache = await App.fileType.getLightningCache(currentPath)
		// lightningCache is string for lightning cache text scripts
		if (
			!definitions ||
			typeof lightningCache === 'string' ||
			lightningCache.length === 0
		)
			return

		const location = getLocation(model, position)

		const { definitionId, transformedWord } = await this.getDefinition(
			word,
			location,
			lightningCache
		)
		if (!definitionId || !transformedWord) return

		let definition = definitions[definitionId]
		if (!definition) return
		if (!Array.isArray(definition)) definition = [definition]

		const projectName = app.project.name
		const connectedFiles = await this.getFilePath(
			transformedWord,
			definition
		)

		const result = await Promise.all(
			connectedFiles.map(async (file) => {
				const filePath = `projects/${projectName}/${file}`
				const uri = Uri.file(filePath)

				if (!editor.getModel(uri)) {
					let fileHandle: AnyFileHandle
					try {
						fileHandle = await app.fileSystem.getFileHandle(
							filePath
						)
					} catch {
						return undefined
					}

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

		return <{ uri: Uri; range: Range }[]>(
			result.filter((res) => res !== undefined)
		)
	}

	async getDefinition(
		word: string,
		location: string,
		lightningCache: ILightningInstruction[]
	) {
		const app = await App.getApp()

		let transformedWord: string | undefined = word
		const definitions = lightningCache
			.map(
				(def) =>
					<const>[
						def.cacheKey,
						def.path,
						{ script: def.script, filter: def.filter },
					]
			)
			.filter((def) => def !== undefined)

		return {
			definitionId: await findAsync(
				definitions,
				async ([def, path, { script, filter }]) => {
					if (path === '') return false

					const matches = isMatch(location, path)
					if (matches) {
						if (filter && filter.includes(word))
							transformedWord = undefined
						if (transformedWord && script)
							transformedWord = await run({
								script,
								env: {
									Bridge: {
										value: transformedWord,
										withExtension: (
											basePath: string,
											extensions: string[]
										) =>
											findFileExtension(
												app.project.fileSystem,
												basePath,
												extensions
											),
									},
								},
							})

						return true
					}
					return false
				}
			)?.then((value) => value?.[0]),
			transformedWord,
		}
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
					[word],
					true
				)) ?? []

			connectedFiles.push(...matches)
		}

		return connectedFiles
	}
}
