import { CancellationToken, Position, Range, editor, languages } from 'monaco-editor'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { MolangData, MolangValueDefinition } from '@/libs/data/bedrock/MolangData'
import { Data } from '@/libs/data/Data'
import { isMatch } from 'bridge-common-utils'
import { getLocation } from '../Language'

interface CompletionContext {
	molangData: MolangData
	fileType?: string
	/** The text on the current line from the start of the Molang expression up to the cursor. */
	textBeforeCursor: string
	/** The partial word directly before the cursor that completions should replace. */
	currentWord: string
	range: Range
}

/**
 * Builds context-sensitive Molang completions. Shared between standalone
 * `.molang` files and Molang embedded within JSON string values.
 */
function getMolangCompletions(context: CompletionContext): languages.CompletionItem[] {
	const { molangData, fileType, textBeforeCursor, currentWord, range } = context

	const textBeforeWord = textBeforeCursor.slice(0, textBeforeCursor.length - currentWord.length)

	// Member access, e.g. "math." or "v." - only suggest the values of that namespace
	if (textBeforeWord.endsWith('.')) {
		const beforeDot = textBeforeWord.slice(0, -1)

		const namespaces = molangData
			.getNamespaces(fileType)
			.filter((namespace) => endsWithToken(beforeDot, namespace))

		if (namespaces.length === 0) return []

		const values = namespaces.flatMap((namespace) => molangData.getValues(namespace, fileType))

		return dedupeByLabel(values.map((value) => valueCompletion(value, range)))
	}

	// Global namespaces (math, query, variable, ...) and, when inside a function
	// call, the allowed values for the current argument.
	const completions: languages.CompletionItem[] = molangData
		.getNamespaces(fileType)
		.map((namespace) => ({
			label: namespace,
			insertText: namespace,
			kind: languages.CompletionItemKind.Variable,
			range,
		}))

	return dedupeByLabel(completions.concat(getArgumentCompletions(context)))
}

/**
 * If the cursor sits inside a function's parentheses and the current argument
 * defines a fixed set of values, suggest those values.
 */
function getArgumentCompletions(context: CompletionContext): languages.CompletionItem[] {
	const { molangData, fileType, textBeforeCursor, range } = context

	const call = getEnclosingCall(textBeforeCursor)
	if (!call) return []

	const value = molangData
		.getValues(call.namespace, fileType)
		.find((value) => value.valueName === call.valueName)

	const values = value?.arguments?.[call.argumentIndex]?.additionalData?.values
	if (!values) return []

	return values.map((value) => ({
		label: value,
		insertText: value,
		kind: languages.CompletionItemKind.Enum,
		range,
	}))
}

interface EnclosingCall {
	namespace: string
	valueName: string
	argumentIndex: number
}

/**
 * Walks backwards from the cursor to find the function call the cursor is
 * currently within, together with the index of the argument being typed.
 */
function getEnclosingCall(text: string): EnclosingCall | undefined {
	let depth = 0
	let argumentIndex = 0
	let openIndex = -1

	for (let index = text.length - 1; index >= 0; index--) {
		const char = text[index]

		if (char === ')') depth++
		else if (char === '(') {
			if (depth === 0) {
				openIndex = index
				break
			}
			depth--
		} else if (char === ',' && depth === 0) argumentIndex++
	}

	if (openIndex === -1) return undefined

	const match = text.slice(0, openIndex).match(/([a-zA-Z_][\w]*)\.([a-zA-Z_][\w]*)$/)
	if (!match) return undefined

	return { namespace: match[1], valueName: match[2], argumentIndex }
}

function valueCompletion(value: MolangValueDefinition, range: Range): languages.CompletionItem {
	const isFunction = !value.isProperty

	return {
		label: value.valueName,
		// Functions insert parentheses and place the cursor between them.
		insertText: isFunction ? `${value.valueName}($0)` : value.valueName,
		insertTextRules: isFunction ? languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
		kind: isFunction ? languages.CompletionItemKind.Function : languages.CompletionItemKind.Variable,
		documentation: value.description,
		range,
	}
}

/** Whether `text` ends with `token` as a whole word (not as part of a longer identifier). */
function endsWithToken(text: string, token: string): boolean {
	return new RegExp(`(^|[^a-zA-Z0-9_])${escapeRegExp(token)}$`).test(text)
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function dedupeByLabel(completions: languages.CompletionItem[]): languages.CompletionItem[] {
	return completions.filter(
		(completion, index, all) => all.findIndex((other) => other.label === completion.label) === index
	)
}

function wordRange(model: editor.ITextModel, position: Position): { range: Range; word: string } {
	const word = model.getWordUntilPosition(position)

	return {
		word: word.word,
		range: new Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
	}
}

/**
 * Completions for standalone `.molang` files.
 */
export async function provideCompletionItems(
	model: editor.ITextModel,
	position: Position,
	_context: languages.CompletionContext,
	_token: CancellationToken
): Promise<languages.CompletionList | undefined> {
	if (!(ProjectManager.currentProject instanceof BedrockProject)) return undefined

	const fileType = ProjectManager.currentProject.fileTypeData.get(model.uri.path)?.id

	const textBeforeCursor = model.getValueInRange(
		new Range(position.lineNumber, 1, position.lineNumber, position.column)
	)

	const { word, range } = wordRange(model, position)

	return {
		suggestions: getMolangCompletions({
			molangData: ProjectManager.currentProject.molangData,
			fileType,
			textBeforeCursor,
			currentWord: word,
			range,
		}),
	}
}

/**
 * Completions for Molang embedded within JSON string values (e.g. inside entity
 * or particle files).
 */
export async function provideInlineJsonCompletionItems(
	model: editor.ITextModel,
	position: Position,
	_context: languages.CompletionContext,
	_token: CancellationToken
): Promise<languages.CompletionList | undefined> {
	if (!(ProjectManager.currentProject instanceof BedrockProject)) return undefined

	const fileType = ProjectManager.currentProject.fileTypeData.get(model.uri.path)
	if (!fileType) return undefined

	const validMolangLocations = await Data.get('packages/minecraftBedrock/location/validMolang.json')
	const locationPatterns = validMolangLocations[fileType.id]
	if (!locationPatterns) return undefined

	const location = await getLocation(model, position)
	if (!isMatch(location, locationPatterns)) return undefined

	const line = model.getLineContent(position.lineNumber)
	const cursor = position.column - 1

	const string = getStringAtCursor(line, cursor)
	if (!string) return undefined

	const { word, range } = wordRange(model, position)

	return {
		suggestions: getMolangCompletions({
			molangData: ProjectManager.currentProject.molangData,
			fileType: fileType.id,
			textBeforeCursor: line.slice(string.start, cursor),
			currentWord: word,
			range,
		}),
	}
}

/**
 * Returns the boundaries of the JSON string the cursor is inside of, or
 * undefined if the cursor is not within a string.
 */
function getStringAtCursor(line: string, cursor: number): { start: number; end: number } | undefined {
	let withinString = false
	let start = -1

	for (let index = 0; index < line.length; index++) {
		if (line[index] !== '"') continue

		if (!withinString) {
			withinString = true
			start = index + 1
		} else {
			if (start <= cursor && cursor <= index) return { start, end: index }
			withinString = false
		}
	}

	// Unterminated string (still being typed)
	if (withinString && start <= cursor) return { start, end: line.length }

	return undefined
}
