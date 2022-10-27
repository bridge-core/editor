export class Settings {
	public static readonly stored: any = {}

	static get(key: string) {
		return this.stored[key]
	}
}
