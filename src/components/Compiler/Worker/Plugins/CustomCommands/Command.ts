import { v1Compat } from './v1Compat'
import { run } from '/@/components/Extensions/Scripts/run'
import { tokenizeCommand } from '/@/components/Languages/Mcfunction/tokenize'
import { castType } from '/@/utils/castType'

export type TTemplate = (commandArgs: unknown[], opts: any) => string | string[]

export class Command {
	protected _name?: string
	protected schema?: any
	protected template?: TTemplate

	constructor(
		protected commandSrc: string,
		protected mode: 'dev' | 'build',
		protected v1Compat: boolean
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
					Bridge: this.v1Compat ? v1Compat(module) : undefined,
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

		const commands = this.template?.(
			args.map((arg) => castType(arg)),
			{
				compilerMode: this.mode,
			}
		)
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

	getSchema() {
		if (!this.schema) return [{ commandName: this.name }]
		else if (Array.isArray(this.schema)) {
			if (this.schema.length === 0) return [{ commandName: this.name }]

			return this.schema.map((schema) => ({
				commandName: this.name,
				...schema,
			}))
		}

		// If commandName is not set on the schema, set it to the current name of the command.
		if (!this.schema.commandName) this.schema.commandName = this.name

		return [this.schema]
	}

	/**
	 * Returns the command src as a string.
	 */
	toString() {
		return this.commandSrc
	}
}
