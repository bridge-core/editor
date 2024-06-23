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

			// TODO: Use latest format version if no version is defined
			const formatVersion: string =
				(<any>json).format_version || ProjectManager.currentProject.config?.targetVersion

			const snippets = ProjectManager.currentProject.snippetLoader.getSnippets(formatVersion, fileType.id, [
				location,
			])

			return {
				suggestions: snippets.map((snippet) => ({
					kind: languages.CompletionItemKind.Snippet,
					label: snippet.name,
					documentation: snippet.description,
					insertText: snippet.getInsertText(),
					insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
				})),
			}
		},
	})

	const textSnippetProvider = {
		provideCompletionItems: async (model: editor.ITextModel, position: Position) => {
			if (!(ProjectManager.currentProject instanceof BedrockProject)) return

			const fileType = ProjectManager.currentProject.fileTypeData.get(model.uri.path)

			// TODO: Use latest format version if no version is defined
			const formatVersion = ProjectManager.currentProject.config?.targetVersion

			const snippets = ProjectManager.currentProject.snippetLoader.getSnippets(
				formatVersion ?? '',
				fileType.id,
				[]
			)

			return {
				suggestions: snippets.map((snippet) => ({
					kind: languages.CompletionItemKind.Snippet,
					label: snippet.name,
					documentation: snippet.description,
					insertText: snippet.getInsertText(),
					insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
				})),
			}
		},
	}

	;['mcfunction', 'molang', 'javascript', 'typescript'].forEach((lang) =>
		languages.registerCompletionItemProvider(lang, <any>textSnippetProvider)
	)
}
