import { markRaw } from 'vue'
import { Signal } from '/@/components/Common/Event/Signal'
import { App } from '/@/App'
import {
	IRequirements,
	RequiresMatcher,
} from '/@/components/Data/RequiresMatcher/RequiresMatcher'
import type { languages } from 'monaco-editor'
import { useMonaco } from '/@/utils/libs/useMonaco'

export interface MolangValueDefinition {
	type: 'math' | 'query' | 'variable' | 'context'
	valueName: string
	description?: string
	isProperty?: boolean
	arguments?: MolangFunctionArgument[]
	isDeprecated?: boolean
	deprecationMessage: string
}

export interface MolangDefinition {
	requires?: IRequirements
	values: MolangValueDefinition[]
}

export interface MolangFunctionArgument {
	argumentName: string
	type: 'string' | 'number'
	additionalData?: {
		values?: string[]
		schemaReference?: string
	}
}

export interface MolangContextDefinition {
	fileType: string
	data: MolangDefinition[]
}

export class MolangData extends Signal<void> {
	protected _baseData?: any
	protected _contextData?: any

	async loadCommandData(packageName: string) {
		const app = await App.getApp()

		this._baseData = markRaw(
			await app.dataLoader.readJSON(
				`data/packages/${packageName}/language/molang/main.json`
			)
		)
		this._contextData = markRaw(
			await app.dataLoader.readJSON(
				`data/packages/${packageName}/language/molang/context.json`
			)
		)

		this.dispatch()
	}

	async getSchemaForFileType(fileType?: string) {
		if (!this._baseData)
			throw new Error(`Acessing molangData before it was loaded.`)

		let validEntries: MolangValueDefinition[] = []
		const requiresMatcher = new RequiresMatcher()
		await requiresMatcher.setup()

		const contextData = (
			this._contextData?.contexts as MolangContextDefinition[]
		).find((entry) => entry.fileType === fileType)?.data

		const allDefinitions: MolangDefinition[] = (
			this._baseData?.vanilla as MolangDefinition[]
		).concat(contextData ?? [])

		for (const entry of allDefinitions) {
			if (!entry.requires || requiresMatcher.isValid(entry.requires))
				validEntries = validEntries.concat(entry.values)
		}

		return validEntries
	}

	/**
	 * Suggestions that should be made available anywhere in a Molang context
	 */
	async getGlobalSuggestions(): Promise<Partial<languages.CompletionItem>[]> {
		const { languages } = await useMonaco()

		return [
			{
				label: 'math',
				kind: languages.CompletionItemKind.Function,
				insertText: 'math',
			},
			{
				label: 'variable',
				kind: languages.CompletionItemKind.Variable,
				insertText: 'variable',
			},
			{
				label: 'v',
				kind: languages.CompletionItemKind.Variable,
				insertText: 'v',
			},
			{
				label: 'context',
				kind: languages.CompletionItemKind.Variable,
				insertText: 'context',
			},
			{
				label: 'c',
				kind: languages.CompletionItemKind.Variable,
				insertText: 'c',
			},
			{
				label: 'query',
				kind: languages.CompletionItemKind.Function,
				insertText: 'query',
			},
			{
				label: 'q',
				kind: languages.CompletionItemKind.Function,
				insertText: 'q',
			},
			{
				label: 'temp',
				kind: languages.CompletionItemKind.Variable,
				insertText: 'temp',
			},
			{
				label: 't',
				kind: languages.CompletionItemKind.Variable,
				insertText: 't',
			},
		]
	}
}
