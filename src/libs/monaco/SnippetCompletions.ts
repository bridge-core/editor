import { BedrockProject } from '@/libs/project/BedrockProject'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { Position, editor, languages } from 'monaco-editor'
import { getLocation } from './languages/Language'
import { getLatestStableFormatVersion } from '../data/bedrock/FormatVersion'
import * as JSONC from 'jsonc-parser'

export function setupSnippetCompletions() {
	languages.registerCompletionItemProvider('json', {
		// @ts-ignore provideCompletionItems doesn't require a range property inside of the completion items
		provideCompletionItems: async (model: editor.ITextModel, position: Position) => {
			if (!(ProjectManager.currentProject instanceof BedrockProject)) return

			const fileType = ProjectManager.currentProject.fileTypeData.get(model.uri.path)

			let json: any
			try {
				json = JSONC.parse(model.getValue())
			} catch {
				json = {}
			}

			const location = await getLocation(model, position)

			const formatVersion: string =
				(<any>json).format_version ?? ProjectManager.currentProject.config?.targetVersion ?? (await getLatestStableFormatVersion())

			const snippets = ProjectManager.currentProject.snippetLoader.getSnippets(formatVersion, fileType.id, [location])

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

			const formatVersion = ProjectManager.currentProject.config?.targetVersion ?? (await getLatestStableFormatVersion())

			const snippets = ProjectManager.currentProject.snippetLoader.getSnippets(formatVersion ?? '', fileType.id, [])

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
