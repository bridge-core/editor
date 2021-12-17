import { Command } from './Command'
import { tokenizeCommand } from 'bridge-common-utils'

/**
 * @param {`/${string}`[]} commands Must start with a "/"
 */
export function transformCommands(
	commands: string[],
	dependencies: Record<string, Command>,
	includeComments: boolean,
	nestingDepth: number = 0
) {
	const processedCommands = []

	for (const writtenCommand of commands) {
		if (!writtenCommand.startsWith('/')) {
			processedCommands.push(writtenCommand)
			continue
		}

		const [commandName, ...args] = tokenizeCommand(
			writtenCommand.slice(1)
		).tokens.map(({ word }) => word)
		const command = dependencies[`command#${commandName}`]

		// Special processing for the execute command which can reference other commands
		if (commandName === 'execute') {
			let nestedCommandIndex = 4

			if (args[nestedCommandIndex] === 'detect') {
				nestedCommandIndex += 6
			}

			if (args[nestedCommandIndex] === undefined) {
				processedCommands.push(writtenCommand)
				continue
			}

			const [nestedCommandName, ...nestedArgs] = args.slice(
				nestedCommandIndex
			)
			const nestedCommand = dependencies[`command#${nestedCommandName}`]

			if (!(nestedCommand instanceof Command)) {
				processedCommands.push(writtenCommand)
				continue
			}

			processedCommands.push(
				...nestedCommand
					.process(
						`${nestedCommandName} ${nestedArgs.join(' ')}`,
						dependencies,
						nestingDepth + 1
					)
					.map((command) =>
						command.startsWith('/')
							? `/execute ${args
									.slice(0, nestedCommandIndex)
									.join(' ')} ${command.slice(1)}`
							: command
					)
			)
			continue
		} else if (!(command instanceof Command)) {
			processedCommands.push(writtenCommand)
			continue
		}

		processedCommands.push(
			...command.process(writtenCommand, dependencies, nestingDepth)
		)
	}

	return processedCommands
		.filter((command) => includeComments || !command.startsWith('#'))
		.map((command) => command.trim())
}
