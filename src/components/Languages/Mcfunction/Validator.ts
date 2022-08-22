import {
	tokenizeCommand,
	tokenizeTargetSelector,
	castType,
} from 'bridge-common-utils'
import { CommandData } from './Data'

export class CommandValidator {
	protected commandData: CommandData

	constructor(commandData: CommandData) {
		this.commandData = commandData
	}

	getType(word: string) {
		const typedWord = castType(word)
		const type = typeof typedWord

		if (type == 'number') return 'number'

		if (type == 'boolean') return 'boolean'

		return type
	}

	async parse(content: string) {
		console.log('Validating!')

		//Split content into lines
		const lines = content.split('\n')

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]

			let { tokens } = tokenizeCommand(line)

			const commandName = tokens[0]

			//If first word is emtpy then this is an empty line
			if (commandName.word == '') continue

			if (
				!(await this.commandData.allCommands()).includes(
					commandName.word
				)
			)
				throw {
					message: 'languages.mcfunction.parse.error.unkown_command',
					line: i,
					start: commandName.startColumn,
					end: commandName.endColumn,
				}

			let definitions = await this.commandData.getCommandDefinitions(
				commandName.word,
				false
			)

			//Remove empty tokens as to not confuse the argument checker
			tokens = tokens.filter((token) => token.word != '')

			//If there are two many arguments than any definition throw an error
			if (
				definitions.find(
					(definition) =>
						definition.arguments.length >= tokens.length - 1
				) == undefined
			)
				throw {
					message:
						'languages.mcfunction.parse.error.too_may_arguments',
					line: i,
					start: tokens[0].startColumn,
					end: tokens[tokens.length - 1].endColumn,
				}

			//Check for a valid command definition
			for (let k = 1; k < tokens.length; k++) {
				const argument = tokens[k]

				for (let j = 0; j < definitions.length; j++) {
					if (definitions[j].arguments.length < k) {
						definitions.splice(j, 1)

						j--

						continue
					}

					const targetArgument = definitions[j].arguments[k - 1]
					const argumentType = await this.commandData.isArgumentType(
						argument.word,
						targetArgument,
						commandName.word
					)

					if (argumentType != 'full') {
						definitions.splice(j, 1)

						j--
					}
				}

				if (definitions.length == 0)
					throw {
						message:
							'languages.mcfunction.parse.error.invalid_argument',
						line: i,
						start: argument.startColumn,
						end: argument.endColumn,
					}
			}
		}
	}
}
