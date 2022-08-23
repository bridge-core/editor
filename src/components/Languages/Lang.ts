import type { languages, editor } from 'monaco-editor'
import { BedrockProject } from '/@/components/Projects/Project/BedrockProject'
import { colorCodes } from './Common/ColorCodes'
import { Language } from './Language'
import { App } from '/@/App'
import { useMonaco } from '/@/utils/libs/useMonaco'

export const config: languages.LanguageConfiguration = {
	comments: {
		lineComment: '##',
	},
}

export const tokenProvider = {
	tokenizer: {
		root: [[/##.*/, 'comment'], [/=|\.|:/, 'definition'], ...colorCodes],
	},
}

const completionItemProvider: languages.CompletionItemProvider = {
	triggerCharacters: ['='],
	provideCompletionItems: async (model, position) => {
		const project = await App.getApp().then((app) => app.project)
		if (!(project instanceof BedrockProject)) return

		const { Range, languages } = await useMonaco()
		const langData = project.langData
		await langData.fired

		const app = await App.getApp()
		// Only auto-complete in a client lang file
		const isClientLang =
			App.fileType.getId(
				app.project.tabSystem?.selectedTab?.getPath()!
			) === 'clientLang'

		if (!isClientLang) return { suggestions: [] }

		const currentLine = model.getLineContent(position.lineNumber)

		// Find out whether our cursor is positioned after a '='
		let isValueSuggestion = false
		for (let i = position.column - 1; i >= 0; i--) {
			const char = currentLine[i]
			if (char === '=') {
				isValueSuggestion = true
			}
		}

		const suggestions: languages.CompletionItem[] = []

		if (!isValueSuggestion) {
			// Get the lang keys that are already set in the file
			const currentLangKeys = new Set(
				model
					.getValue()
					.split('\n')
					.map((line) => line.split('=')[0].trim())
			)

			const validLangKeys = (await langData.getValidLangKeys()).filter(
				(key) => !currentLangKeys.has(key)
			)

			suggestions.push(
				...validLangKeys.map((key) => ({
					range: new Range(
						position.lineNumber,
						position.column,
						position.lineNumber,
						position.column
					),
					kind: languages.CompletionItemKind.Text,
					label: key,
					insertText: key,
				}))
			)
		} else {
			// Generate a value based on the key
			// 1. Check whether the cursor is after a key and equals sign, but no value yet (e.g. "tile.minecraft:dirt.name=")
			const line = model
				.getValueInRange(
					new Range(
						position.lineNumber,
						0,
						position.lineNumber,
						position.column
					)
				)
				.toLowerCase()
			if (line[line.length - 1] === '=') {
				// 2. Find the part of the key that isn't a common key prefix/suffix (e.g. the identifier)
				const commonParts = ['name', 'tile', 'item', 'entity', 'action']
				const key = line.substring(0, line.length - 1)
				let uniqueParts = key
					.split('.')
					.filter((part) => !commonParts.includes(part))

				// 3. If there are 2 parts and one is spawn_egg, then state that "Spawn " should be added to the front of the value
				const spawnEggIndex = uniqueParts.indexOf('spawn_egg')
				const isSpawnEgg =
					uniqueParts.length === 2 && spawnEggIndex >= 0
				if (isSpawnEgg)
					uniqueParts.slice(spawnEggIndex, spawnEggIndex + 1)

				// 4. If there is still multiple parts left, search for the part with a namespaced identifier, as that is commonly the bit being translated (e.g. "minecraft:pig" -> "Pig")
				if (uniqueParts.length > 1) {
					const id = uniqueParts.find((part) => part.includes(':'))
					if (id) uniqueParts = [id]
				}

				// 5. Hopefully there is only one part left now, if there isn't, the first value will be used. If the value is a namespace (contains a colon), remove the namespace, then capitalise and propose
				if (uniqueParts[0].includes(':'))
					uniqueParts[0] = uniqueParts[0].split(':').pop() ?? ''
				const translation = `${
					isSpawnEgg ? 'Spawn ' : ''
				}${uniqueParts[0]
					.split('_')
					.map((val) => `${val[0].toUpperCase()}${val.slice(1)}`)
					.join(' ')}`

				suggestions.push({
					label: translation,
					insertText: translation,
					kind: languages.CompletionItemKind.Text,
					range: new Range(
						position.lineNumber,
						position.column,
						position.lineNumber,
						position.column
					),
				})
			}
		}

		return {
			suggestions,
		}
	},
}

export class LangLanguage extends Language {
	constructor() {
		super({
			id: 'lang',
			extensions: ['lang'],
			config,
			tokenProvider,
			completionItemProvider,
		})

		// Highlight namespaces
		App.getApp().then(async (app) => {
			await app.projectManager.projectReady.fired
			this.updateTokenProvider({
				tokenizer: {
					root: [
						...tokenProvider.tokenizer.root,
						...new Set(
							[
								'minecraft',
								'bridge',
								app.projectConfig.get().namespace,
							]
								.filter((k) => k !== undefined)
								.map((word) => [word, 'keyword'])
						),
					],
				},
			})
		})
	}

	validate(model: editor.IModel) {}
}
