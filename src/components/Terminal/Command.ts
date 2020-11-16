import parse from 'minimist'

export type TArgument = string | ((arg: string) => boolean)
export interface IArgType<T extends string | number | boolean> {
	type: T extends string
		? 'string'
		: T extends number
		? 'number'
		: T extends boolean
		? 'boolean'
		: never
	required?: boolean
	default?: T
	description?: string
}

const commands = new Set<Command>()

export abstract class Command {
	protected logs: string[] = []
	protected abstract description: string
	protected abstract command: TArgument[]
	protected abstract args: Record<string, IArgType<string | boolean | number>>

	constructor() {
		commands.add(this)
	}

	is(command: string[]) {
		if (command.length !== this.command.length) return false

		for (let i = 0; i < command.length; i++) {
			const validateWith = this.command[i]
			if (typeof validateWith === 'string' && command[i] !== validateWith)
				return false
			else if (
				typeof validateWith === 'function' &&
				!validateWith(command[i])
			)
				return false
		}

		return true
	}

	hasArgs(args: Record<string, unknown>) {
		for (const [
			argName,
			{ default: defaultVal, required, type },
		] of Object.entries(this.args)) {
			const current = args[argName]

			if (current !== undefined) {
				if (typeof current !== type) {
					this.logs.push(
						`Type mismatch for argument --${argName}: Expected ${type}, got ${typeof current}!`
					)
					return false
				}
			} else if (required) {
				this.logs.push(`Missing required argument --${argName}!`)
				return false
			} else if (defaultVal) {
				args[argName] = defaultVal
			}
		}
		return true
	}

	abstract execute(args: Record<string, unknown>): void

	executeWrapper(args: Record<string, unknown>) {
		if (args.help) {
			this.logs.push(this.getBaseCommandStr().toUpperCase())
			this.logs.push(this.description)
			this.logs.push(`\nArguments:`)

			for (const [argName, arg] of Object.entries(this.args)) {
				this.logs.push(
					`${this.getArgumentStr(argName, arg)}${
						arg.description ? ` | ${arg.description}` : ''
					}`
				)
			}
		} else if (this.hasArgs(args)) {
			this.execute(args)
		}
	}

	dispose() {
		commands.delete(this)
	}

	getLogs() {
		const logs = this.logs
		this.logs = []
		return logs
	}

	protected getBaseCommandStr() {
		return this.command
			.map(commandPart =>
				typeof commandPart === 'string' ? commandPart : '<any>'
			)
			.join(' ')
	}
	protected getArgumentStr(
		argName: string,
		arg: IArgType<string | number | boolean>
	) {
		const base = `--${argName} <${arg.type}${
			arg.default ? `=${arg.default}` : ''
		}>`
		return arg.required ? base : `(${base})`
	}

	getCommandStructureString() {
		let base = this.getBaseCommandStr()
		for (const [argName, arg] of Object.entries(this.args)) {
			base += ' ' + this.getArgumentStr(argName, arg)
		}
		return base
	}
}

export function executeCommand(command: string) {
	const args = parse(command.split(/\s+/g))

	for (const command of commands) {
		if (command.is(args._)) {
			command.executeWrapper(args)
			return command.getLogs()
		}
	}

	if (args.help) {
		return [...commands].map(command => command.getCommandStructureString())
	}
}

// @ts-ignore
window.executeCommand = executeCommand
