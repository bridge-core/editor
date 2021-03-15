export abstract class Schema {
	public abstract type: string

	validate(source: any) {}
}
