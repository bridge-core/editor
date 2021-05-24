import type { HistoryEntry } from './HistoryEntry'

export class EditorHistory {
	protected undoStack: HistoryEntry[] = []
	protected redoStack: HistoryEntry[] = []

	undo() {
		const entry = this.undoStack.pop()
		if (!entry) return

		this.redoStack.push(entry.undo())
	}

	redo() {
		const entry = this.redoStack.pop()
		if (!entry) return

		this.undoStack.push(entry.undo())
	}

	push(entry: HistoryEntry) {
		this.undoStack.push(entry)
		this.redoStack = []
	}
}
