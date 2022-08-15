import { ICommandArgument } from './Data'

export class ResolvedCommandArguments {
	constructor(
		protected args: ICommandArgument[] = [],
		public readonly lastParsedIndex: number = 0
	) {}

	static from(other: ResolvedCommandArguments[]) {
		const biggestLastParsed = other.reduce((a, b) => {
			return a.lastParsedIndex > b.lastParsedIndex ? a : b
		}).lastParsedIndex

		return new ResolvedCommandArguments(
			other.map((x) => x.args).flat(),
			biggestLastParsed
		)
	}

	get arguments() {
		return this.args
	}
}
