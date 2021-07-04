import { run } from '/@/components/Extensions/Scripts/run'
import { tokenizeCommand } from '/@/components/Languages/Mcfunction/tokenize'

export type TTemplate = (commandArgs: unknown[], opts: any) => string | string[]

export class Command {
	protected _name?: string
	protected schema?: any
	protected template?: TTemplate

	constructor(
		protected commandSrc: string,
		protected mode: 'dev' | 'build'
	) {}

	get name() {
		return this._name ?? 'unknown'
	}

	async load(type?: 'client' | 'server') {
		const module = { exports: {} }
		try {
			run({
				script: this.commandSrc,
				env: {
					module: module,
					defineCommand: (x: any) => x,
				},
			})
		} catch (err) {
			console.error(err)
		}

		if (typeof module.exports !== 'function') return

		const name = (name: string) => (this._name = name)
		let schema: Function = (schema: any) => (this.schema = schema)
		let template: Function = () => {}

		if (!type || type === 'server') {
			schema = () => {}
			template = (func: TTemplate) => {
				this.template = (commandArgs: unknown[], opts: any) => {
					try {
						return func(commandArgs, opts)
					} catch (err) {
						console.error(err)
						return []
					}
				}
			}
		}

		await module.exports({
			name,
			schema,
			template,
		})
	}

	process(command: string) {
		if (command.startsWith('/')) command = command.slice(1)

		const [commandName, ...args] = tokenizeCommand(command).tokens.map(
			({ word }) => word
		)

		const commands = this.template?.(args, {})
		let processedCommands: string[] = []
		if (typeof commands === 'string')
			processedCommands = commands.split('\n')
		else if (Array.isArray(commands))
			processedCommands = commands.filter(
				(command) => typeof command === 'string'
			)
		else {
			const errrorMsg = `Failed to process command ${
				this._name
			}; Invalid command template return type: Expected string[] or string, received ${typeof commands}`
			console.error(errrorMsg)
			processedCommands.push(`# ${errrorMsg}`)
		}

		return processedCommands.map((command) =>
			command.startsWith('/') || command.startsWith('#')
				? command
				: `/${command}`
		)
	}
}
