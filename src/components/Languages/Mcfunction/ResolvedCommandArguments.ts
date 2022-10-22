import { ICommandArgument } from './Data'

export class ResolvedCommandArguments {
	constructor(
		protected args: ICommandArgument[] = [],
		public readonly lastParsedIndex: number = 0,
		public readonly isValidResult: boolean = true
	) {}

	static from(other: ResolvedCommandArguments[]) {
		const biggestLastParsed =
			other
				.filter((a) => a.isValidResult)
				.sort((a, b) => b.lastParsedIndex - a.lastParsedIndex)[0]
				?.lastParsedIndex ?? 0

		return new ResolvedCommandArguments(
			other.map((x) => x.args).flat(),
			biggestLastParsed
		)
	}

	get arguments() {
		return this.args
	}
}
