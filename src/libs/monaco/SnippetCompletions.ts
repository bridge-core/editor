import { BedrockProject } from '@/libs/project/BedrockProject'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { Position, editor, languages } from 'monaco-editor'
import { getLocation } from './languages/Language'

export function setupSnippetCompletions() {
	languages.registerCompletionItemProvider('json', {
		// @ts-ignore provideCompletionItems doesn't require a range property inside of the completion items
		provideCompletionItems: async (model: editor.ITextModel, position: Position) => {
			if (!(ProjectManager.currentProject instanceof BedrockProject)) return

			const fileType = ProjectManager.currentProject.fileTypeData.get(model.uri.path)

			let json: any
			try {
				json = JSON.parse(model.getValue())
			} catch {
				json = {}
			}

			const location = await getLocation(model, position)

			const formatVersion: string =
				(<any>json).format_version || ProjectManager.currentProject.config?.targetVersion

			const snippets = ProjectManager.currentProject.snippetLoader.getSnippets(formatVersion, fileType.id, [
				location,
			])

			console.log(fileType, location, formatVersion)

			console.log(snippets)

			return {
				suggestions: snippets.map((snippet) => ({
					kind: languages.CompletionItemKind.Snippet,
					label: snippet.displayData.name,
					documentation: snippet.displayData.description,
					insertText: snippet.insertText,
					insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
				})),
			}
		},
	})
}
