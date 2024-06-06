import { Position, languages, Range, editor, CancellationToken } from 'monaco-editor'
import { ArgumentContext, SelectorValueContext, Token, getContext } from './Parser'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { BedrockProject } from '@/libs/project/BedrockProject'

export async function provideCompletionItems(
	model: editor.ITextModel,
	position: Position,
	context: languages.CompletionContext,
	_: CancellationToken
): Promise<languages.CompletionList | undefined> {
	if (!(ProjectManager.currentProject instanceof BedrockProject)) return undefined

	const line = model.getLineContent(position.lineNumber)

	const cursor = position.column - 1

	const contexts = await getContext(line, cursor)

	let completions: languages.CompletionItem[] = []

	const commandData = ProjectManager.currentProject.commandData

	for (const context of contexts) {
		if (context.kind === 'command') {
			const commands = commandData
				.getCommands()
				.filter(
					(command, index, commands) =>
						commands.findIndex((otherCommand) => command.commandName === otherCommand.commandName) === index
				)

			completions = completions.concat(
				makeCompletions(
					commands.map((command) => command.commandName),
					commands.map((command) => command.description),
					languages.CompletionItemKind.Keyword,
					position,
					context.token
				)
			)
		}

		if (context.kind === 'argument') {
			const argumentContext = context as ArgumentContext

			for (const variation of argumentContext.variations) {
				const argumentType = variation.arguments[argumentContext.argumentIndex]

				if (argumentType.type === 'string') {
					if (argumentType.additionalData?.values) {
						completions = completions.concat(
							makeCompletions(
								argumentType.additionalData.values,
								undefined,
								languages.CompletionItemKind.Enum,
								position,
								context.token
							)
						)
					}

					if (argumentType.additionalData?.schemaReference) {
						const schema = ProjectManager.currentProject.schemaData.getAndResolve(
							argumentType.additionalData.schemaReference
						)

						const values = ProjectManager.currentProject.schemaData.getAutocompletions(schema)

						completions = completions.concat(
							makeCompletions(
								values,
								undefined,
								languages.CompletionItemKind.Enum,
								position,
								context.token
							)
						)
					}
				}

				if (argumentType.type === 'boolean') {
					completions = completions.concat(
						makeCompletions(
							['true', 'false'],
							undefined,
							languages.CompletionItemKind.Enum,
							position,
							context.token
						)
					)
				}

				if (argumentType.type === 'selector') {
					completions = completions.concat(
						makeCompletions(
							['@p', '@r', '@a', '@e', '@s', '@initiator'],
							undefined,
							languages.CompletionItemKind.Enum,
							position,
							context.token
						)
					)
				}
			}
		}

		if (context.kind === 'selectorArgument') {
			const selectorArguments = commandData
				.getSelectorArguments()
				.filter(
					(argument, index, selectorArguments) =>
						selectorArguments.findIndex(
							(otherArgument) => argument.argumentName === otherArgument.argumentName
						) === index
				)

			completions = completions.concat(
				makeCompletions(
					selectorArguments.map((command) => command.argumentName),
					undefined,
					languages.CompletionItemKind.Keyword,
					position,
					context.token
				)
			)
		}

		if (context.kind === 'selectorOperator') {
			completions = completions.concat(
				makeCompletions(['=', '=!'], undefined, languages.CompletionItemKind.Keyword, position, context.token)
			)
		}

		if (context.kind === 'selectorValue') {
			const selectorValueContext = context as SelectorValueContext

			if (selectorValueContext.argument.type === 'string') {
				if (selectorValueContext.argument.additionalData?.values) {
					completions = completions.concat(
						makeCompletions(
							selectorValueContext.argument.additionalData.values,
							undefined,
							languages.CompletionItemKind.Enum,
							position,
							context.token
						)
					)
				}

				if (selectorValueContext.argument.additionalData?.schemaReference) {
					const schema = ProjectManager.currentProject.schemaData.getAndResolve(
						selectorValueContext.argument.additionalData.schemaReference
					)

					const values = ProjectManager.currentProject.schemaData.getAutocompletions(schema)

					completions = completions.concat(
						makeCompletions(values, undefined, languages.CompletionItemKind.Enum, position, context.token)
					)
				}
			}

			if (selectorValueContext.argument.type === 'boolean') {
				completions = completions.concat(
					makeCompletions(
						['true', 'false'],
						undefined,
						languages.CompletionItemKind.Enum,
						position,
						context.token
					)
				)
			}
		}
	}

	completions = completions.filter(
		(completion, index, completions) =>
			completions.findIndex((otherCompletion) => otherCompletion.label === completion.label) === index
	)

	return {
		suggestions: completions,
	}
}

function makeCompletions(
	options: string[],
	detail: string[] | undefined,
	kind: languages.CompletionItemKind,
	position: Position,
	token?: Token | null
) {
	if (!token) {
		return options.map((option, index) => ({
			label: option,
			insertText: option,
			detail: detail ? detail[index] : undefined,
			kind,
			range: new Range(position.lineNumber, position.column, position.lineNumber, position.column),
		}))
	}

	return options
		.filter((option) => option.startsWith(token.word))
		.map((option, index) => ({
			label: option,
			insertText: option,
			detail: detail ? detail[index] : undefined,
			kind,
			range: new Range(
				position.lineNumber,
				token.start + 1,
				position.lineNumber,
				token.start + token.word.length + 1
			),
		}))
}
