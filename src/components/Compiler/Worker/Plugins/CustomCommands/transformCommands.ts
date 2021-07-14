import { Command } from './Command'

export function transformCommands(
	commands: string[],
	dependencies: Record<string, Command>,
	includeComments: boolean
) {
	const processedCommands = []

	for (const writtenCommand of commands) {
		const spaceIndex = writtenCommand.indexOf(' ')
		const commandName = writtenCommand.slice(
			1,
			spaceIndex === -1 ? writtenCommand.length : spaceIndex
		)
		const command = dependencies[`command#${commandName}`]

		if (!(command instanceof Command)) {
			processedCommands.push(writtenCommand)
			continue
		}

		processedCommands.push(...command.process(writtenCommand))
	}

	return processedCommands
		.filter((command) => includeComments || !command.startsWith('#'))
		.map((command) => command.trim())
}
