import type { CommandData, ICompletionItem } from '../Data'
import { useMonaco } from '../../../../utils/libs/useMonaco'

export class SelectorArguments {
	constructor(protected commandData: CommandData) {}

	getSchema() {
		return this.commandData.getSelectorArgumentsSchema()
	}

	async getNextCompletionItems(tokens: string[]) {
		if (tokens.length === 1 || tokens[tokens.length - 2] === ',')
			return this.getArgumentNameCompletions()

		if (
			tokens[tokens.length - 2] === '=' ||
			tokens[tokens.length - 2] === '=!'
		) {
			const argumentName = tokens[tokens.length - 3]

			return await this.getArgumentTypeCompletions(argumentName)
		}

		return []
	}

	async getArgumentFromWord(word: string) {
		const args = await this.getSchema()

		return args.find((arg) => arg.argumentName === word)
	}

	async getArgumentNameCompletions(): Promise<ICompletionItem[]> {
		const { languages } = await useMonaco()

		const args = await this.getSchema()

		return args.map((arg) => ({
			label: arg.argumentName,
			insertText: arg.argumentName,
			kind: languages.CompletionItemKind.Property,
			documentation: arg.description,
		}))
	}

	async getArgumentTypeCompletions(argumentName: string) {
		const args = await this.getSchema()

		const completionItems = await Promise.all(
			args
				.filter((arg) => arg.argumentName === argumentName)
				.map((arg) =>
					this.commandData.getCompletionItemsForArgument(arg)
				)
		)

		return completionItems.flat()
	}
}
