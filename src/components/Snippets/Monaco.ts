import type { languages, editor, Position } from 'monaco-editor'
import { getLocation } from '/@/utils/monaco/getLocation'
import { App } from '/@/App'
import { FileTab } from '../TabSystem/FileTab'
import json5 from 'json5'
import { getLatestFormatVersion } from '../Data/FormatVersions'
import { useMonaco } from '../../utils/libs/useMonaco'

export async function registerJsonSnippetProvider() {
	const { languages } = await useMonaco()

	languages.registerCompletionItemProvider('json', {
		// @ts-ignore provideCompletionItems doesn't require a range property inside of the completion items
		provideCompletionItems: async (
			model: editor.ITextModel,
			position: Position
		) => {
			const app = await App.getApp()
			const location = await getLocation(model, position)
			const currentTab = app.project.tabSystem?.selectedTab

			if (!(currentTab instanceof FileTab)) return { suggestions: [] }
			const fileType = currentTab.getFileType()

			let json: any
			try {
				json = json5.parse(model.getValue())
			} catch {
				json = {}
			}

			const currentFormatVersion: string =
				(<any>json).format_version ||
				app.project.config.get().targetVersion ||
				(await getLatestFormatVersion())

			return {
				suggestions: app.project.snippetLoader
					.getSnippetsFor(currentFormatVersion, fileType, [location])
					.map((snippet) => ({
						kind: languages.CompletionItemKind.Snippet,
						label: snippet.displayData.name,
						documentation: snippet.displayData.description,
						insertText: snippet.insertText,
						insertTextRules:
							languages.CompletionItemInsertTextRule
								.InsertAsSnippet,
					})),
			}
		},
	})
}

export async function registerTextSnippetProvider() {
	const { languages } = await useMonaco()

	const textSnippetProvider = <languages.CompletionItemProvider>(<unknown>{
		provideCompletionItems: async (
			model: editor.ITextModel,
			position: Position
		) => {
			const app = await App.getApp()
			const currentTab = app.project.tabSystem?.selectedTab

			if (!(currentTab instanceof FileTab)) return { suggestions: [] }
			const fileType = currentTab.getFileType()

			const currentFormatVersion: string =
				app.project.config.get().targetVersion ||
				(await getLatestFormatVersion())

			return {
				suggestions: app.project.snippetLoader
					.getSnippetsFor(currentFormatVersion, fileType, [])
					.map((snippet) => ({
						kind: languages.CompletionItemKind.Snippet,
						label: snippet.displayData.name,
						documentation: snippet.displayData.description,
						insertText: snippet.insertText,
						insertTextRules:
							languages.CompletionItemInsertTextRule
								.InsertAsSnippet,
					})),
			}
		},
	})

	;['mcfunction', 'molang', 'javascript', 'typescript'].forEach((lang) =>
		languages.registerCompletionItemProvider(lang, textSnippetProvider)
	)
}
