import { pathToName } from '../pathToName'
import { BaseType } from '../ToTypes/Type'
import { relative } from '/@/utils/path'

export interface ISchemaResult {
	diagnostics: IDiagnostic[]
}

export interface IDiagnostic {
	message: string
	// location: string
}

export interface ICompletionItem {
	type: 'object' | 'array' | 'value' | 'snippet'
	label: string
	value: unknown
}

export type TSchemaType =
	| 'object'
	| 'array'
	| 'string'
	| 'integer'
	| 'number'
	| 'boolean'
	| 'null'

export const pathWildCard = '-!<bridge:any-schema>!-'

export abstract class Schema {
	public readonly schemaType?: 'ifSchema' | 'refSchema'
	public abstract readonly types: TSchemaType[]
	constructor(
		protected location: string,
		protected key: string,
		protected value: unknown
	) {}

	// abstract validate(obj: unknown): IDiagnostic[]
	validate(obj: unknown): IDiagnostic[] {
		return []
	}
	isValid(obj: unknown) {
		return this.validate(obj).length === 0
	}
	abstract getCompletionItems(obj: unknown): ICompletionItem[]
	abstract getSchemasFor(
		obj: unknown,
		location: (string | number | undefined)[]
	): Schema[]

	toTypeDefinition(
		hoisted: Set<Schema>,
		forceEval?: boolean
	): BaseType | null {
		return null
	}
	getName() {
		return pathToName(
			relative(
				'file:///data/packages/minecraftBedrock/schema',
				this.location
			)
		)
	}
	getLocation() {
		return this.location
	}
}
