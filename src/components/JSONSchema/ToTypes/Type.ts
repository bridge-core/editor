export abstract class BaseType {
	public abstract toString(): string

	withName(name: string) {
		return `type ${name} = ${this.toString()};`
	}
}
