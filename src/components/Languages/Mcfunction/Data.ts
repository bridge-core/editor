import { markRaw } from '@vue/composition-api'
import { compare } from 'compare-versions'
import { MoLang } from 'molang'
import { languages } from 'monaco-editor'
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

interface ICompletionItem {
	label?: string
	insertText: string
	documentation?: string
	kind: languages.CompletionItemKind
}

/**
 * A class that stores data on all Minecraft commands
 */
export class CommandData extends Signal<void> {
	protected _data?: any

	async loadCommandData(packageName: string) {
		const app = await App.getApp()

		this._data = markRaw(
			await app.dataLoader.readJSON(
				`data/packages/${packageName}/language/mcfunction/main.json`
			)
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

		this.dispatch()
	}

	get shouldIgnoreCustomCommands() {
		return App.getApp().then(
			(app) => !app.projectManager.projectReady.hasFired
		)
	}

	protected async getSchema(
		ignoreCustomCommands = false
	): Promise<ICommand[]> {
		const app = await App.getApp()

		if (!this._data)
			throw new Error(`Acessing commandData before it was loaded.`)

		const validEntries: any[] = []
		for await (const entry of this._data.vanilla) {
			if (
				entry.requires &&
				(await app.requires.meetsRequirements(entry.requires))
			)
				validEntries.push(entry)
			else if (!entry.requires) validEntries.push(entry)
		}

		return validEntries
			.map((entry: any) => entry.commands)
			.flat()
			.concat(ignoreCustomCommands ? [] : await generateCommandSchemas())
			.filter((command: unknown) => command !== undefined)
	}

	allCommands(query?: string, ignoreCustomCommands = false) {
		return this.getSchema(ignoreCustomCommands).then((schema) => [
			...new Set<string>(
				schema
					.map((command: any) => command?.commandName)
					.filter(
						(commandName: string) =>
							!query || commandName?.includes(query)
					)
			),
		])
	}

	getCommandCompletionItems(query?: string, ignoreCustomCommands = false) {
		return this.getSchema(ignoreCustomCommands).then((schema) => {
			const completionItems: ICompletionItem[] = []

			schema
				.filter(
					(command: ICommand) =>
						!query || command.commandName?.includes(query)
				)
				.forEach((command) => {
					if (
						completionItems.some(
							(item) => item.label === command.commandName
						)
					)
						return

					completionItems.push({
						insertText: command.commandName,
						label: command.commandName,
						documentation: command.description,
						kind: languages.CompletionItemKind.Method,
					})
				})

			return completionItems
		})
	}

	/**
	 * Given a commandName, return all matching command definitions
	 */
	async getCommandDefinitions(
		commandName: string,
		ignoreCustomCommands: boolean
	) {
		const commands = await this.getSchema(ignoreCustomCommands).then(
			(schema) => {
				return schema.filter(
					(command: any) => command.commandName === commandName
				)
			}
		)

		return commands
	}

	async getNextCompletionItems(path: string[]): Promise<ICompletionItem[]> {
		if (path.length <= 1)
			return await this.getCommandCompletionItems(
				path[0],
				await this.shouldIgnoreCustomCommands
			)

		const commandName = path.shift()
		const currentCommands = await this.getCommandDefinitions(
			commandName!,
			await this.shouldIgnoreCustomCommands
		)

		if (!currentCommands || currentCommands.length === 0) return []

		const completionItems: ICompletionItem[] = []
		;(
			await Promise.all(
				currentCommands.map(async (currentCommand: ICommand) => {
					// Get command argument
					const args = await this.getNextCommandArgument(
						currentCommand,
						[...path]
					)
					if (args.length === 0) return []

					// Return possible completion items for the argument
					return await Promise.all(
						args.map((arg) => this.getCompletionItems(arg))
					)
				})
			)
		)
			.flat(2)
			.forEach((item: ICompletionItem) => {
				if (
					completionItems.some(
						(completionItem) => completionItem.label === item.label
					)
				)
					return

				completionItems.push(item)
			})

		return completionItems
	}

	/**
	 * Given a sequence of command arguments & the currentCommand, return possible values for the next argument
	 */
	protected async getNextCommandArgument(
		currentCommand: ICommand,
		path: string[]
	): Promise<ICommandArgument[]> {
		if (!currentCommand.arguments || currentCommand.arguments.length === 0)
			return []

		const args = currentCommand.arguments ?? []
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
						(
							await this.getCommandDefinitions(
								currentStr,
								await this.shouldIgnoreCustomCommands
							)
						).map((command) =>
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

		if (!args[argumentIndex]) return []
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
				return strMatchArray(
					testStr,
					await this.allCommands(
						undefined,
						await App.getApp().then(
							(app) => app.projectManager.hasFired
						)
					)
				)
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
	): Promise<ICompletionItem[]> {
		// Test whether argument type is defined
		if (!commandArgument.type) {
			// If additionalData is defined, return its values
			if (commandArgument.additionalData)
				return this.toCompletionItem(
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
				return this.mergeCompletionItems(
					await this.getCommandCompletionItems(),
					{ documentation: commandArgument.description }
				)
			case 'selector':
				return this.toCompletionItem(
					['@a', '@e', '@p', '@s', '@r', '@initiator'],
					commandArgument.description
				)
			case 'boolean':
				return this.toCompletionItem(
					['true', 'false'],
					commandArgument.description,
					languages.CompletionItemKind.Value
				)
			case 'number':
				return this.toCompletionItem(
					['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
					commandArgument.description,
					languages.CompletionItemKind.Value
				)
			case 'coordinate':
				return this.toCompletionItem(
					['~', '^'],
					commandArgument.description,
					languages.CompletionItemKind.Operator
				)
			case 'string': {
				if (commandArgument.additionalData?.values)
					return this.toCompletionItem(
						commandArgument.additionalData.values,
						commandArgument.description
					)
				else if (commandArgument.additionalData?.schemaReference)
					return this.toCompletionItem(
						<string[]>(
							this.resolveDynamicReference(
								commandArgument.additionalData.schemaReference
							).map(({ value }) => value)
						),
						commandArgument.description
					)
				else return []
			}
			case 'jsonData':
				return this.toCompletionItem(
					['{}'],
					commandArgument.description,
					languages.CompletionItemKind.Struct
				)
			case 'blockState':
				return this.toCompletionItem(
					['[]'],
					commandArgument.description,
					languages.CompletionItemKind.Struct
				)
		}

		return []
	}
	protected toCompletionItem(
		strings: string[],
		documentation?: string,
		kind = languages.CompletionItemKind.Text
	): ICompletionItem[] {
		return strings.map((str) => ({
			label: str,
			insertText: str,
			kind,
			documentation,
		}))
	}
	protected mergeCompletionItems(
		completionItems: ICompletionItem[],
		partialItem: Partial<ICompletionItem>
	) {
		return completionItems.map((item) => ({
			...item,
			documentation: partialItem.documentation
				? `${partialItem.documentation}\n\n${item.documentation ?? ''}`
				: item.documentation,
		}))
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
