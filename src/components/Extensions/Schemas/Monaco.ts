import json5 from 'json5'
import { editor, languages, Position } from 'monaco-editor'
import { getLatestFormatVersion } from '../../Data/FormatVersions'
import { FileTab } from '../../TabSystem/FileTab'
import { App } from '/@/App'
import { getLocation } from '/@/utils/monaco/getLocation'

languages.registerCompletionItemProvider('json', {
	// @ts-ignore provideCompletionItems doesn't require a range property inside of the completion items
	provideCompletionItems: async (
		model: editor.ITextModel,
		position: Position
	) => {
		const app = await App.getApp()
		const location = getLocation(model, position)
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

		const relevantSchemas = app.extensionLoader
			.mapActive((ext) =>
				ext.extensionSchemaProvider.relevantSchemas(
					currentFormatVersion,
					fileType,
					location
				)
			)
			.flat()

		return {
			suggestions: relevantSchemas.map((schema) => ({
				insertText: `"${Object.keys(schema.properties)[0]}": {\${1}}`,
				kind: languages.CompletionItemKind.Property,
				label: Object.keys(schema.properties)[0],
				insertTextRules:
					languages.CompletionItemInsertTextRule.InsertAsSnippet,
			})),
		}
	},
})
