export abstract class FileImporter {
	constructor(public extensions: string[]) {}

	public abstract onImport(file: { name: string; data: ArrayBuffer }, basePath: string): Promise<void> | void
}
