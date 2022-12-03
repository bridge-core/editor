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
}
