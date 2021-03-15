interface IDiagnostic {
	path: string
	message: string
}
export class SchemaValidator {
	protected diagnostics: IDiagnostic[] = []

	constructor(schema: any) {}

	validate(source: any) {
		// TODO: Validate that source matches schema

		return this.diagnostics.length === 0
	}

	addDiagnostic(diagnostic: IDiagnostic) {
		this.diagnostics.push(diagnostic)
	}
}
