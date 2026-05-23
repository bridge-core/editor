import { markRaw } from 'vue'
import { MoLang } from 'molang'
import type { languages } from 'monaco-editor'
import { generateCommandSchemas } from '../../Compiler/Worker/Plugins/CustomCommands/generateSchemas'
import { RequiresMatcher } from '../../Data/RequiresMatcher/RequiresMatcher'
import { RefSchema } from '../../JSONSchema/Schema/Ref'
import { strMatchArray } from './strMatch'
import { App } from '/@/App'
import { Signal } from '/@/components/Common/Event/Signal'
import { SelectorArguments } from './TargetSelector/SelectorArguments'
import { useMonaco } from '../../../utils/libs/useMonaco'
import { ResolvedCommandArguments } from './ResolvedCommandArguments'
/**
 * An interface that describes a command
 */
export interface ICommand {
	commandName: string
	description: string
	arguments: ICommandArgument[]
}

export interface ISelectorArgument extends ICommandArgument {
	additionalData?: {
		schemaReference?: string
		values?: string[]
		multipleInstancesAllowed?: 'always' | 'whenNegated' | 'never'
		supportsNegation?: boolean
	}
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
	| 'scoreData'
	| 'subcommand'
	| 'integerRange'
	| `$${string}`

/**
 * An interface that describes a command argument
 */
export interface ICommandArgument {
	argumentName: string
	description: string
	type: TArgumentType
	allowMultiple?: boolean
	additionalData?: {
		schemaReference?: string
		values?: string[]
	}
	isOptional: boolean
}

export interface ICompletionItem {
	label?: string
	insertText: string
	documentation?: string
	kind: languages.CompletionItemKind
	insertTextRules?: languages.CompletionItemInsertTextRule
}

/**
 * A class that stores data on all Minecraft commands
 */
export class CommandData extends Signal<void> {
	public readonly selectorArguments = new SelectorArguments(this)
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

		for (const { commands = [], subcommands = [] } of this._data.vanilla) {
			const allCommands = commands.concat(
				subcommands.map((subcommand: any) => subcommand.commands).flat()
			)
			for (const command of allCommands) {
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

	protected async getSchema() {
		if (!this._data)
			throw new Error(`Acessing commandData before it was loaded.`)

		const validEntries: any[] = []
		const requiresMatcher = new RequiresMatcher()
		await requiresMatcher.setup()

		for await (const entry of this._data.vanilla) {
			if (requiresMatcher.isValid(entry.requires))
				validEntries.push(entry)
			else if (!entry.requires) validEntries.push(entry)
		}

		return validEntries
	}
	protected async getCommandsSchema(
		ignoreCustomCommands = false
	): Promise<ICommand[]> {
		return (await this.getSchema())
			.map((entry: any) => entry.commands)
			.flat()
			.concat(ignoreCustomCommands ? [] : await generateCommandSchemas())
			.filter((command: unknown) => command !== undefined)
	}
	async getSelectorArgumentsSchema(): Promise<ISelectorArgument[]> {
		return (await this.getSchema())
			.map((entry: any) => entry.selectorArguments)
			.flat()
			.filter(
				(selectorArgument: unknown) => selectorArgument !== undefined
			)
	}

	async getSubcommands(commandName: string): Promise<ICommand[]> {
		const schemas = await this.getSchema()

		return schemas
			.map(
				(schema) =>
					schema.subcommands?.filter(
						(subcommand: any) =>
							subcommand.commandName === commandName
					) ?? []
			)
			.flat(1)
			.map((subcommands) => subcommands.commands)
			.flat(1)
	}

	allCommands(query?: string, ignoreCustomCommands = false) {
		return this.getCommandsSchema(ignoreCustomCommands).then((schema) => [
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
	allSelectorArguments() {
		return this.getSelectorArgumentsSchema().then((schema) => [
			...new Set<string>(
				schema.map(
					(selectorArgument: any) => selectorArgument?.argumentName
				)
			),
		])
	}

	async getCommandCompletionItems(
		query?: string,
		ignoreCustomCommands = false
	) {
		const { languages } = await useMonaco()

		const schema = await this.getCommandsSchema(ignoreCustomCommands)
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
	}

	/**
	 * Given a commandName, return all matching command definitions
	 */
	async getCommandDefinitions(
		commandName: string,
		ignoreCustomCommands: boolean
	) {
		const commands = await this.getCommandsSchema(
			ignoreCustomCommands
		).then((schema) => {
			return schema.filter(
				(command: any) => command.commandName === commandName
			)
		})

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
					const args = (
						await this.getNextCommandArgument(currentCommand, [
							...path,
						])
					).arguments
					if (args.length === 0) return []

					// Return possible completion items for the argument
					return await Promise.all(
						args.map((arg) =>
							this.getCompletionItemsForArgument(
								arg,
								currentCommand.commandName
							)
						)
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
	): Promise<ResolvedCommandArguments> {
		if (!currentCommand.arguments || currentCommand.arguments.length === 0)
			return new ResolvedCommandArguments([], 0, false)

		const args = currentCommand.arguments ?? []
		let argumentIndex = 0
		let subcommandStopArg = null
		let shouldProposeStopArg = false

		for (let i = 0; i < path.length; i++) {
			const currentStr = path[i]

			if (currentStr === '') continue

			const matchType = await this.isArgumentType(
				currentStr,
				args[argumentIndex],
				currentCommand.commandName
			)

			if (matchType === 'none')
				return new ResolvedCommandArguments([], i, false)
			else if (matchType === 'partial')
				return new ResolvedCommandArguments(
					path.length === i + 1 ? [args[argumentIndex]] : [],
					i
				)

			// Propose arguments from nested command when necessary
			if (args[argumentIndex].type === 'command' && i + 1 < path.length) {
				return ResolvedCommandArguments.from(
					(
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
				)
			} else if (args[argumentIndex].type === 'subcommand') {
				const subcommands = await this.getSubcommands(
					currentCommand.commandName
				)

				// Try to find stop argument within path
				subcommandStopArg = args[argumentIndex + 1] ?? null
				let foundStopArg = false
				let stopArgIndex = i
				while (
					subcommandStopArg &&
					!foundStopArg &&
					stopArgIndex < path.length
				) {
					stopArgIndex++
					foundStopArg =
						(await this.isArgumentType(
							path[stopArgIndex],
							subcommandStopArg,
							currentCommand.commandName
						)) === 'full'
				}

				// Stop argument was entered, skip to next argument after stop argument
				if (foundStopArg) {
					argumentIndex += 2
					i = stopArgIndex
					continue
				}

				const validSubcommands = subcommands.filter(
					(subcommand) => subcommand.commandName === path[i]
				)
				if (validSubcommands.length === 0)
					return new ResolvedCommandArguments([], i)

				const resolvedArgs = ResolvedCommandArguments.from(
					await Promise.all(
						validSubcommands.map((validSubcommand) =>
							this.getNextCommandArgument(
								validSubcommand,
								path.slice(i + 1)
							)
						)
					)
				)
				const nextArgs = resolvedArgs.arguments

				// We have no more arguments for the subcommand
				if (nextArgs.length === 0) {
					// If multiple subcommands are valid, we should propose the next subcommand
					if (args[argumentIndex].allowMultiple) {
						i += resolvedArgs.lastParsedIndex + 1
						shouldProposeStopArg = true
					} else {
						// If only one subcommand is valid, we should propose the next argument
						argumentIndex++
					}

					continue
				}

				return resolvedArgs
			}

			// Check next argument
			argumentIndex++
			// If argumentIndex to large, return
			if (argumentIndex >= args.length)
				return new ResolvedCommandArguments([], i)
		}

		if (!args[argumentIndex])
			return new ResolvedCommandArguments([], path.length - 1)
		// If we are here, we are at the next argument, return it
		return new ResolvedCommandArguments(
			[args[argumentIndex]].concat(
				subcommandStopArg && shouldProposeStopArg
					? [subcommandStopArg]
					: []
			),
			path.length - 1
		)
	}

	/**
	 * Given an argument type, test whether a string matches the type
	 */
	async isArgumentType(
		testStr: string,
		commandArgument: ICommandArgument,
		commandName?: string
	): Promise<'none' | 'partial' | 'full'> {
		switch (commandArgument.type) {
			case 'string': {
				if (!commandArgument.additionalData?.values) return 'full'

				const values =
					commandArgument.additionalData?.values ??
					this.resolveDynamicReference(
						commandArgument.additionalData.schemaReference!
					) ??
					[]

				return strMatchArray(testStr, values)
			}
			case 'command': {
				return strMatchArray(
					testStr,
					await this.allCommands(
						undefined,
						await this.shouldIgnoreCustomCommands
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
			case 'subcommand': {
				const subcommands = commandName
					? await this.getSubcommands(commandName)
					: []
				return strMatchArray(
					testStr,
					subcommands.map((subcommand) => subcommand.commandName)
				)
			}
			case 'integerRange':
				return /^([\d]*)?([.]{2})?([\d]*)?$/.test(testStr)
					? 'full'
					: 'none'
			default:
				return 'none'
		}
	}

	/**
	 * Given a commandArgument, return completion items for it
	 */
	async getCompletionItemsForArgument(
		commandArgument: ICommandArgument,
		commandName?: string
	): Promise<ICompletionItem[]> {
		const { languages } = await useMonaco()

		// If argument type isn't defined, set it to "string" to use "additonalData" property
		commandArgument.type ??= 'string'

		switch (commandArgument.type) {
			case 'command':
				return this.mergeCompletionItems(
					await this.getCommandCompletionItems(),
					{ documentation: commandArgument.description }
				)
			case 'selector':
				return this.toCompletionItem(
					['@a', '@e', '@p', '@s', '@r', '@initiator', '@n'],
					commandArgument.description,
					languages.CompletionItemKind.TypeParameter
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
				let values: string[] = []
				if (commandArgument.additionalData?.values)
					values = values.concat(
						commandArgument.additionalData.values
					)
				if (commandArgument.additionalData?.schemaReference)
					values = values.concat(
						<string[]>(
							this.resolveDynamicReference(
								commandArgument.additionalData.schemaReference
							).map(({ value }) => value)
						)
					)

				if (values.length === 0) return []
				return this.toCompletionItem(
					values,
					commandArgument.description,
					languages.CompletionItemKind.Constant
				)
			}
			case 'jsonData':
				return this.toCompletionItem(
					[['{}', '{${1:json data}}']],
					commandArgument.description,
					languages.CompletionItemKind.Struct
				)
			case 'blockState':
				return this.toCompletionItem(
					[['[]', '[${1:block states}]']],
					commandArgument.description,
					languages.CompletionItemKind.Struct
				)
			case 'scoreData':
				return this.toCompletionItem(
					[['{}', '{${1:scores}}']],
					commandArgument.description,
					languages.CompletionItemKind.Struct
				)
			case 'subcommand':
				return this.toCompletionItem(
					commandName
						? (await this.getSubcommands(commandName)).map(
								(command) => command.commandName
						  )
						: [],
					undefined,
					languages.CompletionItemKind.Constant
				)
			case 'integerRange':
				return this.toCompletionItem(
					['0', '1', '2', '3', '..0', '0..', '0..1'],
					commandArgument.description,
					languages.CompletionItemKind.Value
				)
		}

		return []
	}
	async toCompletionItem(
		strings: (string | [string, string])[],
		documentation?: string,
		kind?: languages.CompletionItemKind
	): Promise<ICompletionItem[]> {
		const { languages } = await useMonaco()
		if (!kind) kind = languages.CompletionItemKind.Text

		return strings.map((str) => ({
			label: Array.isArray(str) ? `${str[0]}` : `${str}`,
			insertText: Array.isArray(str) ? `${str[1]}` : `${str}`,
			kind: kind!,
			documentation,
			insertTextRules: Array.isArray(str)
				? languages.CompletionItemInsertTextRule.InsertAsSnippet
				: undefined,
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
