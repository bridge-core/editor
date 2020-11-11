export const terminalCommands = new Set<
	ReturnType<typeof createTerminalCommand>
>()

export function getAutoCompletions(commandParts: string[]) {
	const autoCompletions: string[] = []

	for (const command of terminalCommands) {
		if (!command.is(commandParts)) continue

		if (command.isReady(commandParts)) {
			command.execute(commandParts)
			return true
		}

		autoCompletions.push(...command.getValidAt(commandParts.length))
	}

	return autoCompletions
}

export function createTerminalCommand(
	commandDef: (string | string[])[],
	callback: (command: string[]) => void
) {
	return {
		is: (commandParts: string[]) => {
			for (let i = 0; i < commandParts.length; i++) {
				if (
					Array.isArray(commandDef[i]) &&
					!commandDef[i].includes(commandParts[i])
				)
					return false
				else if (commandDef[i] !== commandParts[i]) return false
			}
			return true
		},
		isReady(commandParts: string[]) {
			return commandDef.length === commandParts.length
		},
		getValidAt(index: number) {
			const atIndex = commandDef[index] ?? []
			return Array.isArray(atIndex) ? atIndex : [atIndex]
		},

		execute(commandParts: string[]) {
			callback(commandParts)
		},
	}
}
