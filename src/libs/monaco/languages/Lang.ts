import { languages } from 'monaco-editor'
import { colorCodes } from './Language'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { Range } from 'monaco-editor'

export function setupLang() {
	languages.register({ id: 'lang', extensions: ['.lang'], aliases: ['lang'] })

	languages.setLanguageConfiguration('lang', {
		comments: {
			lineComment: '##',
		},
	})

	languages.setMonarchTokensProvider('lang', {
		tokenizer: {
			root: [[/##.*/, 'comment'], [/=|\.|:/, 'definition'], ...colorCodes],
		},
	})

	languages.registerCompletionItemProvider('lang', {
		triggerCharacters: ['=', '\n'],
		provideCompletionItems: async (model, position) => {
			if (!ProjectManager.currentProject) return
			if (!(ProjectManager.currentProject instanceof BedrockProject)) return

			const fileType = ProjectManager.currentProject.fileTypeData.get(model.uri.path.substring(1))

			if (!fileType || fileType.id === 'clientLang') return

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

				let validLangKeys = (await ProjectManager.currentProject.langData.getKeys()).filter(
					(key) => !currentLangKeys.has(key)
				)

				validLangKeys = validLangKeys.filter((key) => key.startsWith(currentLine))

				suggestions.push(
					...(await Promise.all(
						validLangKeys.map(async (key) => ({
							range: new Range(position.lineNumber, 1, position.lineNumber, position.column),
							kind: languages.CompletionItemKind.Text,
							label: key,
							insertText: key,
						}))
					))
				)
			} else {
				// Generate a value based on the key
				const line = model
					.getValueInRange(new Range(position.lineNumber, 0, position.lineNumber, position.column))
					.toLowerCase()

				// Check whether the cursor is after a key and equals sign, but no value yet (e.g. "tile.minecraft:dirt.name=")
				if (line[line.length - 1] === '=') {
					const translation = (await guessValue(line)) ?? ''
					suggestions.push({
						label: translation,
						insertText: translation,
						kind: languages.CompletionItemKind.Text,
						range: new Range(position.lineNumber, position.column, position.lineNumber, position.column),
					})
				}
			}

			return {
				suggestions,
			}
		},
	})
}

async function guessValue(line: string) {
	// 1. Find the part of the key that isn't a common key prefix/suffix (e.g. the identifier)
	const commonParts = ['name', 'tile', 'item', 'entity', 'action']
	const key = line.substring(0, line.length - 1)
	let uniqueParts = key.split('.').filter((part) => !commonParts.includes(part))

	// 2. If there are 2 parts and one is spawn_egg, then state that "Spawn " should be added to the front of the value
	const spawnEggIndex = uniqueParts.indexOf('spawn_egg')
	const isSpawnEgg = uniqueParts.length === 2 && spawnEggIndex >= 0
	if (isSpawnEgg) uniqueParts.slice(spawnEggIndex, spawnEggIndex + 1)

	// 3. If there is still multiple parts left, search for the part with a namespaced identifier, as that is commonly the bit being translated (e.g. "minecraft:pig" -> "Pig")
	if (uniqueParts.length > 1) {
		const id = uniqueParts.find((part) => part.includes(':'))
		if (id) uniqueParts = [id]
	}

	// 4. Hopefully there is only one part left now, if there isn't, the first value will be used. If the value is a namespace (contains a colon), remove the namespace, then capitalise and propose
	if (!uniqueParts[0]) return ''

	if (uniqueParts[0].includes(':')) uniqueParts[0] = uniqueParts[0].split(':').pop() ?? ''
	const translation = `${isSpawnEgg ? 'Spawn ' : ''}${uniqueParts[0]
		.split('_')
		.map((val) => `${val[0].toUpperCase()}${val.slice(1)}`)
		.join(' ')}`

	return translation
}
