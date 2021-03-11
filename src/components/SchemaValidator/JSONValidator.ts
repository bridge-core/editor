import type { editor } from 'monaco-editor'
import { Position } from './Common/Position'

enum MarkerSeverity {
	Hint = 1,
	Info = 2,
	Warning = 4,
	Error = 8,
}

interface IGroup {
	curlyBrackets: Position[]
	squareBrackets: Position[]
	quoteStart: Position | undefined
}

interface IDiagnostic {
	position: Position
	markerLength: number
	message: string
	severity?: MarkerSeverity
}

export class JSONValidator {
	protected i = 0
	protected source!: string
	protected diagnostics: editor.IMarkerData[] = []
	protected position = new Position(0, 0)
	protected groups: IGroup = {
		curlyBrackets: [],
		squareBrackets: [],
		quoteStart: undefined,
	}
	protected comma?: Position

	// Returns whether the parser has already entered the global object ({} or [])
	get isOnTopLevel() {
		return (
			this.groups.curlyBrackets.length === 0 &&
			this.groups.squareBrackets.length === 0
		)
	}
	get nextNonWhitespaceCharacter() {
		for (let i = this.i + 1; i < this.source.length; i++) {
			const c = this.source[i]
			if (c !== ' ' && c !== '\t' && c !== '\r' && c !== '\n') return c
		}
	}
	get previousCharacter() {
		return this.source[this.i - 1]
	}
	get previousNonWhitespaceCharacter() {
		for (let i = this.i - 1; i > -1; i--) {
			const c = this.source[i]
			if (c !== ' ' && c !== '\t' && c !== '\r' && c !== '\n') return c
		}
	}

	validate(source: string) {
		this.diagnostics = []
		this.position = new Position(0, 0)
		this.groups = {
			curlyBrackets: [],
			squareBrackets: [],
			quoteStart: undefined,
		}
		this.comma = undefined
		this.source = source

		for (this.i = 0; this.i < source.length; this.i++) {
			const p = source[this.i - 1] // Previous character
			const c = source[this.i] //Current character

			if (c === '\n') {
				// Multiline quotes are not allowed so we need to throw an error at this expression
				const quoteStart = this.groups.quoteStart
				if (quoteStart) {
					this.addDiagnostic({
						position: quoteStart,
						markerLength: this.position.delta(quoteStart).column,
						message: 'Missing "\\"" character',
					})
					// Make sure to reset the quoteStart
					this.groups.quoteStart = undefined
				}

				// Advance position
				this.position.advanceLineNumber()
				continue
			} else if (this.handleGroups(c)) {
				// Noop, logic handled inside of handleGroups(...) method
			} else if (c === '"' && p !== '\\') {
				// Handle quotes
				if (!this.groups.quoteStart)
					this.groups.quoteStart = this.position.clone()
				else this.groups.quoteStart = undefined
			} else if (c === ',') {
				if (this.isOnTopLevel) {
					// JSON matches invalid structure like this "{},"
					this.addDiagnostic({
						position: this.position,
						markerLength: 1,
						message: `Unexpected "," character; expected end of JSON file`,
					})
				} else {
					this.comma = this.position.clone()
					this.checkCommaPosition()
				}
			}

			this.position.advanceColumn()
		}

		this.ensureClosedGroups()
		console.log(source, this.diagnostics)

		return this.diagnostics.length === 0
	}

	ensureClosedGroups() {
		for (const position of this.groups.curlyBrackets) {
			this.addDiagnostic({
				position: position,
				markerLength: 1,
				message: `Missing closing bracket`,
			})
		}
		for (const position of this.groups.squareBrackets) {
			this.addDiagnostic({
				position: position,
				markerLength: 1,
				message: `Missing closing bracket`,
			})
		}
	}

	protected handleGroups(c: string) {
		if (c === '{') {
			this.groups.curlyBrackets.push(this.position.clone())
		} else if (c === '}') {
			if (this.groups.curlyBrackets.length === 0)
				this.addDiagnostic({
					position: this.position,
					markerLength: 1,
					message: `Missing opening bracket`,
				})
			else this.groups.curlyBrackets.pop()
			this.checkCommaAfterClosingBracket()
		} else if (c === '[') {
			this.groups.squareBrackets.push(this.position.clone())
		} else if (c === ']') {
			if (this.groups.squareBrackets.length === 0)
				this.addDiagnostic({
					position: this.position,
					markerLength: 1,
					message: `Missing opening bracket`,
				})
			else this.groups.squareBrackets.pop()
			this.checkCommaAfterClosingBracket()
		} else {
			return false
		}

		return true
	}
	protected checkCommaAfterClosingBracket() {
		if (!this.isOnTopLevel) {
			const nextChar = this.nextNonWhitespaceCharacter
			if (
				!this.comma &&
				!this.isClosingBracket(nextChar) &&
				nextChar !== ','
			) {
				this.addDiagnostic({
					position: this.position,
					markerLength: 1,
					message: `Expected comma`,
				})
				this.comma = undefined
			}
		}
	}
	protected checkCommaPosition() {
		if (
			this.comma &&
			this.isClosingBracket(this.nextNonWhitespaceCharacter)
		) {
			this.addDiagnostic({
				position: this.comma,
				markerLength: 1,
				message: `Invalid comma after closing bracket`,
			})
			this.comma = undefined
		}
	}
	isClosingBracket(c?: string) {
		return c === ']' || c === '}'
	}

	protected addDiagnostic({
		position,
		markerLength,
		message,
		severity = MarkerSeverity.Error,
	}: IDiagnostic) {
		this.diagnostics.push({
			startLineNumber: position.lineNumber,
			endLineNumber: position.lineNumber,
			startColumn: position.column,
			endColumn: position.column + markerLength,
			message,
			severity,
		})
	}
}
