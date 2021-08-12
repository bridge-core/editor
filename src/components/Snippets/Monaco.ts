import { languages, editor, Position } from 'monaco-editor'
import { getLocation } from 'jsonc-parser'
import { App } from '/@/App'
import { FileTab } from '../TabSystem/FileTab'

languages.registerCompletionItemProvider('json', {
	// @ts-ignore provideCompletionItems doesn't require a range property inside of the completion items
	provideCompletionItems: async (
		model: editor.ITextModel,
		position: Position
	) => {
		const app = await App.getApp()
		const location = getLocation(
			model.getValue(),
			model.getOffsetAt(position)
		).path.join('/')
		const currentTab = app.project.tabSystem?.selectedTab

		if (!(currentTab instanceof FileTab)) return { suggestions: [] }
		const fileType = currentTab.getFileType()

		return {
			suggestions: app.project.snippetLoader
				.getSnippetsFor(fileType, [location])
				.map((snippet) => ({
					kind: languages.CompletionItemKind.Snippet,
					label: snippet.displayData.name,
					documentation: snippet.displayData.description,
					insertText: snippet.insertText,
				})),
		}
	},
})
