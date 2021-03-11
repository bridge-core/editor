export class Position {
	constructor(protected _lineNumber: number, protected _column: number) {}

	get lineNumber() {
		return this._lineNumber
	}
	get column() {
		return this._column
	}

	clone() {
		return new Position(this._lineNumber, this._column)
	}

	delta(position: Position) {
		return new Position(
			this.lineNumber - position.lineNumber,
			this.column - position.column
		)
	}

	advanceColumn(amount = 1) {
		this._column += amount
	}
	advanceLineNumber(amount = 1) {
		this._lineNumber += amount
		this._column = 0
	}
}
