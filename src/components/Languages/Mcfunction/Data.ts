import { compare } from 'compare-versions'
import { MoLang } from 'molang'
import { generateCommandSchemas } from '../../Compiler/Worker/Plugins/CustomCommands/generateSchemas'
import { RefSchema } from '../../JSONSchema/Schema/Ref'
import { strMatchArray } from './strMatch'
import { App } from '/@/App'
import { Signal } from '/@/components/Common/Event/Signal'

/**
 * An interface that describes a command
 */
export interface ICommand {
	commandName: string
	description: string
	arguments: ICommandArgument[]
}
/**
 * Type holding all possible argument types
 */
export type TArgumentType =
	| 'string'
	| 'number'
	| 'boolean'
	| 'selector'
	| 'molang'
	| 'blockState'
	| 'jsonData'
	| 'coordinate'
	| 'command'
	| `$${string}`

/**
 * An interface that describes a command argument
 */
export interface ICommandArgument {
	argumentName: string
	description: string
	type: TArgumentType
	additionalData?: any
}

/**
 * RegExp to validate whether a string is a valid command coordinate
 */
const commandCoordinateRegExp = /^((([-+]?[0-9]+(\.[0-9]+)?)?[ \t]*){3}|\^([-+]?[0-9]+(\.[0-9]+)?)?[ \t]*){3}|(\~([-+]?[0-9]+(\.[0-9]+)?)?[ \t]*){3}$/

/**
 * A class that stores data on all Minecraft commands
 */
export class CommandData extends Signal<void> {
	protected _data?: any

	async loadCommandData(packageName: string) {
		const app = await App.getApp()

		this._data = await app.fileSystem.readJSON(
			`data/packages/${packageName}/language/mcfunction/main.json`
		)

		const customTypes: Record<string, ICommandArgument[]> =
			this._data.$customTypes ?? {}

		for (const { commands } of this._data.vanilla) {
			for (const command of commands) {
				if (!command.arguments) continue

				command.arguments = command.arguments
					.map((argument: ICommandArgument) => {
						if (!argument.type || !argument.type.startsWith('$'))
							return argument

						const replaceWith = customTypes[argument.type.slice(1)]
						if (!replaceWith) return argument

						return replaceWith.map((replaceArgument) => ({
							...argument,
							...replaceArgument,
						}))
					})
					.flat()
			}
		}

		// console.log(this._data)
		this.dispatch()
	}

	protected async getSchema(): Promise<ICommand[]> {
		const projectTargetVersion = await App.getApp().then(
			(app) => app.project.config.get().targetVersion
		)

		if (!this._data)
			throw new Error(`Acessing commandData before it was loaded.`)

		const validEntries = this._data.vanilla.filter(
			({ targetVersion }: any) =>
				!projectTargetVersion ||
				!targetVersion ||
				compare(
					projectTargetVersion,
					targetVersion[1],
					targetVersion[0]
				)
		)

		return validEntries
			.map((entry: any) => entry.commands)
			.flat()
			.concat(await generateCommandSchemas())
			.filter((command: unknown) => command !== undefined)
	}

	allCommands(query?: string) {
		return this.getSchema().then((schema) => [
			...new Set<string>(
				schema
					.map((command: any) => command?.commandName)
					.filter(
						(commandName: string) =>
							!query || commandName.includes(query)
					)
			),
		])
	}

	/**
	 * Given a commandName, return all matching command definitions
	 */
	async getCommands(commandName: string) {
		const commands = await this.getSchema().then((schema) => {
			return schema.filter(
				(command: any) => command.commandName === commandName
			)
		})

		return commands
	}

	async getNextCompletionItems(path: string[]) {
		if (path.length <= 1) return await this.allCommands(path[0])

		const commandName = path.shift()
		const currentCommands = await this.getCommands(commandName!)

		if (!currentCommands || currentCommands.length === 0) return []

		return [
			...new Set<string>(
				(
					await Promise.all(
						currentCommands.map(
							async (currentCommand: ICommand) => {
								// Get command argument
								const args = await this.getNextCommandArgument(
									currentCommand,
									[...path]
								)
								if (args.length === 0) return []

								// Return possible completion items for the argument
								return await Promise.all(
									args.map((arg) =>
										this.getCompletionItems(arg)
									)
								)
							}
						)
					)
				).flat(2)
			),
		]
	}

	/**
	 * Given a sequence of command arguments & the currentCommand, return possible values for the next argument
	 */
	protected async getNextCommandArgument(
		currentCommand: ICommand,
		path: string[]
	): Promise<ICommandArgument[]> {
		const args = currentCommand.arguments
		let argumentIndex = 0

		for (let i = 0; i < path.length; i++) {
			const currentStr = path[i]

			if (currentStr === '') continue

			const matchType = await this.isArgumentType(
				currentStr,
				args[argumentIndex]
			)

			if (matchType === 'none') return []
			else if (matchType === 'partial')
				return path.length === i + 1 ? [args[argumentIndex]] : []

			// Propose arguments from nested command when necessary
			if (args[argumentIndex].type === 'command' && i + 1 < path.length) {
				return (
					await Promise.all(
						(await this.getCommands(currentStr)).map((command) =>
							this.getNextCommandArgument(
								command,
								path.slice(i + 1)
							)
						)
					)
				).flat()
			}

			// Check next argument
			argumentIndex++
			// If argumentIndex to large, return
			if (argumentIndex >= args.length) return []
		}

		// If we are here, we are at the next argument, return it
		return [args[argumentIndex]]
	}

	/**
	 * Given an argument type, test whether a string matches the type
	 */
	protected async isArgumentType(
		testStr: string,
		commandArgument: ICommandArgument
	): Promise<'none' | 'partial' | 'full'> {
		switch (commandArgument.type) {
			case 'string': {
				if (!commandArgument.additionalData?.values) return 'full'

				const values =
					commandArgument.additionalData?.values ??
					this.resolveDynamicReference(
						commandArgument.additionalData.schemaReference
					) ??
					[]

				return strMatchArray(testStr, values)
			}
			case 'command': {
				return strMatchArray(testStr, await this.allCommands())
			}

			case 'number':
				return !isNaN(Number(testStr)) ? 'full' : 'none'
			case 'selector':
				return testStr.startsWith('@') ? 'full' : 'none'
			case 'boolean':
				return testStr === 'true' || testStr === 'false'
					? 'full'
					: 'none'
			case 'coordinate':
				return testStr.startsWith('~') ||
					testStr.startsWith('^') ||
					!isNaN(Number(testStr))
					? 'full'
					: 'none'
			case 'jsonData':
				return /^\{.*\}$/.test(testStr) ? 'full' : 'none'
			case 'blockState':
				return /^\[.*\]$/.test(testStr) ? 'full' : 'none'
			case 'molang': {
				const molang = new MoLang()

				try {
					molang.parse(testStr)
				} catch (e) {
					return 'none'
				}

				return 'full'
			}
			default:
				return 'none'
		}
	}

	/**
	 * Given a commandArgument, return completion items for it
	 */
	protected async getCompletionItems(
		commandArgument: ICommandArgument
	): Promise<string[]> {
		// Test whether argument type is defined
		if (!commandArgument.type) {
			// If additionalData is defined, return its values
			if (commandArgument.additionalData)
				return (
					commandArgument.additionalData?.values ??
					this.resolveDynamicReference(
						commandArgument.additionalData.schemaReference
					) ??
					[]
				)

			return []
		}

		switch (commandArgument.type) {
			case 'command':
				return [...new Set(await this.allCommands())]
			case 'selector':
				return ['@a', '@e', '@p', '@s', '@r', '@initiator']
			case 'boolean':
				return ['true', 'false']
			case 'number':
				return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
			case 'coordinate':
				return ['~', '^']
			case 'string': {
				if (commandArgument.additionalData?.values)
					return commandArgument.additionalData.values
				else if (commandArgument.additionalData?.schemaReference)
					return <string[]>(
						this.resolveDynamicReference(
							commandArgument.additionalData.schemaReference
						).map(({ value }) => value)
					)
				else return []
			}
			case 'jsonData':
				return ['{}']
			case 'blockState':
				return ['[]']
		}

		return []
	}

	/**
	 * Dynamic references hook into our JSON schema engine to pull in dynamic data such as entity events
	 */
	protected resolveDynamicReference(reference: string) {
		const refSchema = new RefSchema(reference, '$ref', reference)

		// Return completions items from refSchema
		return refSchema.getCompletionItems({})
	}
}
