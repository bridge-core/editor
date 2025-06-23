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
	valueName: string
	description?: string
	isProperty?: boolean
	arguments?: MolangFunctionArgument[]
	isDeprecated?: boolean
	deprecationMessage: string
}

export interface MolangDefinition {
	requires?: IRequirements
	namespace: string[]
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

	async getSchema(fileType?: string) {
		if (!this._baseData)
			throw new Error(`Acessing base molangData before it was loaded.`)

		let validEntries: MolangDefinition[] = []
		const requiresMatcher = new RequiresMatcher()
		await requiresMatcher.setup()

		// Get file type specific schemas if needed
		let contextData
		if (fileType) contextData = this.getContextSchema(fileType)

		// Combine the context schemas with the base schemas
		const allDefinitions: MolangDefinition[] = (
			this._baseData?.vanilla as MolangDefinition[]
		).concat(contextData ?? [])

		// Validate each schema by "requires" property and return valid entries
		for (const entry of allDefinitions) {
			if (!entry.requires || requiresMatcher.isValid(entry.requires))
				validEntries = validEntries.concat(entry)
		}

		return validEntries
	}

	getContextSchema(fileType?: string) {
		if (!this._contextData)
			throw new Error(`Acessing context molangData before it was loaded.`)

		// Find context schema for the specified file type, or return all context schemas if no file type is defined
		const contextData = (
			this._contextData?.contexts as MolangContextDefinition[]
		).find((entry) => (fileType ? entry.fileType === fileType : true))

		return contextData?.data ?? []
	}

	async getCompletionItemFromValues(values: MolangValueDefinition[]) {
		const { languages } = await useMonaco()
		return values
			.filter((value) => !value.isDeprecated)
			.map((value) => {
				return {
					insertText: `${value.valueName}${
						value.isProperty ? '' : '()'
					}`,
					kind: value.isProperty
						? languages.CompletionItemKind.Variable
						: languages.CompletionItemKind.Function,
					label: value.valueName,
					documentation: value.description,
				}
			})
	}

	async getNamespaceSuggestions() {
		const { languages } = await useMonaco()
		return [
			{
				label: 'math',
				kind: languages.CompletionItemKind.Variable,
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
				kind: languages.CompletionItemKind.Variable,
				insertText: 'query',
			},
			{
				label: 'q',
				kind: languages.CompletionItemKind.Variable,
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

	/**
	 * Returns a list of all keywords from the schema value names
	 */
	async allValues() {
		return this.getSchema().then((schema) =>
			[
				...new Set(
					schema
						.concat(this.getContextSchema())
						.map((def) => def.values)
				),
			]
				.map((def) => def.map((def) => def.valueName))
				.flat()
		)
	}
}
