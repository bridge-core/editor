export const terminalCommands = new Set<TerminalCommand>()

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

// @ts-ignore
window.getAutoCompletions = getAutoCompletions
// @ts-ignore
window.terminalCommands = terminalCommands

export class TerminalCommand {
	constructor(
		protected commandDef: (string | string[])[],
		protected callback: (command: string[]) => void
	) {
		terminalCommands.add(this)
	}

	is(commandParts: string[]) {
		for (let i = 0; i < commandParts.length; i++) {
			const isArray = Array.isArray(this.commandDef[i])
			if (isArray && !this.commandDef[i].includes(commandParts[i]))
				return false
			else if (!isArray && this.commandDef[i] !== commandParts[i])
				return false
		}
		return true
	}
	isReady(commandParts: string[]) {
		return this.commandDef.length === commandParts.length
	}
	getValidAt(index: number) {
		const atIndex = this.commandDef[index] ?? []
		return Array.isArray(atIndex) ? atIndex : [atIndex]
	}

	execute(commandParts: string[]) {
		this.callback(commandParts)
	}

	dispose() {
		terminalCommands.delete(this)
	}
}
