import { BedrockProject } from '@/libs/project/BedrockProject'
import { Data } from '../Data'
import { Requirements } from './RequirementsMatcher'

export interface MolangFunctionArgument {
	argumentName: string
	type?: 'string' | 'number'
	additionalData?: {
		values?: string[]
		schemaReference?: string
	}
}

export interface MolangValueDefinition {
	valueName: string
	description?: string
	isProperty?: boolean
	arguments?: MolangFunctionArgument[]
	isDeprecated?: boolean
	deprecationMessage?: string
}

export interface MolangDefinition {
	requires?: Requirements
	namespace: string[]
	values: MolangValueDefinition[]
}

export interface MolangContextDefinition {
	fileType: string
	data: MolangDefinition[]
}

/**
 * The Molang namespaces that always exist regardless of the schema. The schema
 * only describes built-in values (e.g. `math.*`), but namespaces such as
 * `variable`/`temp`/`context` are user-defined and therefore have no schema
 * values, yet should still be offered as top-level suggestions.
 */
const standardNamespaces = ['math', 'query', 'q', 'variable', 'v', 'context', 'c', 'temp', 't']

/**
 * Loads the Molang language schema shipped with the editor packages and exposes
 * helpers for building context-sensitive auto-completions.
 *
 * The schema is split into two files:
 * - `main.json` holds the vanilla definitions available everywhere.
 * - `context.json` holds definitions that are only available within a specific
 *   file type (e.g. `v.particle_age` is only valid inside particle files).
 */
export class MolangData {
	private baseData: any
	private contextData: any

	constructor(public project: BedrockProject) {}

	public async setup() {
		this.baseData = await Data.get('packages/minecraftBedrock/language/molang/main.json')
		this.contextData = await Data.get('packages/minecraftBedrock/language/molang/context.json')
	}

	/**
	 * Returns the definitions that are valid for the current project, optionally
	 * including the definitions specific to the given file type.
	 */
	public getSchema(fileType?: string): MolangDefinition[] {
		const definitions: MolangDefinition[] = (this.baseData?.vanilla ?? []).concat(
			fileType ? this.getContextSchema(fileType) : []
		)

		return definitions.filter(
			(definition) => !definition.requires || this.project.requirementsMatcher.matches(definition.requires)
		)
	}

	/**
	 * Returns the context specific definitions for a file type, or every context
	 * definition if no file type is given.
	 */
	public getContextSchema(fileType?: string): MolangDefinition[] {
		const contexts = (this.contextData?.contexts ?? []) as MolangContextDefinition[]

		if (!fileType) return contexts.flatMap((context) => context.data)

		return contexts.find((context) => context.fileType === fileType)?.data ?? []
	}

	/**
	 * Returns the unique list of namespaces available in the given context,
	 * e.g. `['math', 'query', 'q', 'variable', 'v']`.
	 */
	public getNamespaces(fileType?: string): string[] {
		return [
			...new Set([
				...standardNamespaces,
				...this.getSchema(fileType).flatMap((definition) => definition.namespace),
			]),
		]
	}

	/**
	 * Returns all values that belong to a namespace within the given context.
	 */
	public getValues(namespace: string, fileType?: string): MolangValueDefinition[] {
		return this.getSchema(fileType)
			.filter((definition) => definition.namespace.includes(namespace))
			.flatMap((definition) => definition.values)
			.filter((value) => !value.isDeprecated)
	}

	/**
	 * Returns the names of every value in the given context, used for syntax
	 * highlighting.
	 */
	public getAllValueNames(fileType?: string): string[] {
		return [...new Set(this.getSchema(fileType).flatMap((definition) => definition.values.map((value) => value.valueName)))]
	}
}
