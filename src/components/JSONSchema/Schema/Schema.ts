export interface ISchemaResult {
	diagnostics: IDiagnostic[]
}

export interface IDiagnostic {
	message: string
	// location: string
}

export interface ICompletionItem {
	type: 'object' | 'array' | 'value' | 'valueArray' | 'snippet'
	label: string
	value: unknown
}

export abstract class Schema {
	public readonly type?: 'ifSchema' | 'refSchema'
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
		location: (string | number)[]
	): Schema[]
}
