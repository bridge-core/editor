import { CancellationToken, Position, editor, languages } from 'monaco-editor'
import { ArgumentContext, parseCommand } from './Parser'
import { Command } from '@/libs/data/bedrock/CommandData'

export async function provideSignatureHelp(
	model: editor.ITextModel,
	position: Position,
	token: CancellationToken,
	context: languages.SignatureHelpContext
): Promise<languages.SignatureHelpResult> {
	const line = model.getLineContent(position.lineNumber)

	const cursor = position.column - 1

	const contexts = await parseCommand(line, cursor)

	let signatures: languages.SignatureInformation[] = []

	for (const context of contexts) {
		if (context.kind === 'argument') {
			const argumentContext = <ArgumentContext>context

			signatures = signatures.concat(
				argumentContext.variations.map((variation) => ({
					label: buildSignature((variation as any).original),
					parameters: [],
					documentation: variation.description,
				}))
			)
		}
	}

	return {
		value: {
			activeParameter: 0,
			activeSignature: 0,
			signatures,
		},
		dispose() {},
	}
}

/**
 * Creates the signature string for a given command variation
 * @example fill <from: coordinates> <to: coordinates> <tileName: string> [tileData: number] [oldBlockHandling: destroy | hollow | keep | outline | replace]
 * @param command
 * @returns the signature as a string
 */
function buildSignature(command: Command): string {
	let signature = command.commandName

	for (const argument of command.arguments) {
		let modifier = '<>'

		if (argument.isOptional) modifier = '[]'

		signature += ` ${modifier[0]}${argument.argumentName ? argument.argumentName + ': ' : ''}${
			argument.additionalData?.values
				? argument.additionalData.values.join(' | ')
				: argument.type.startsWith('$')
				? argument.type.substring(1)
				: argument.type
		}${modifier[1]}${argument.allowMultiple ? '...' : ''}`
	}

	return signature
}
