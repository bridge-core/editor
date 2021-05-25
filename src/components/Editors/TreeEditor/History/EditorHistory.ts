import type { TreeEditor } from '../TreeEditor'
import type { HistoryEntry } from './HistoryEntry'

export class EditorHistory {
	protected undoStack: HistoryEntry[] = []
	protected redoStack: HistoryEntry[] = []

	constructor(protected parent: TreeEditor) {}

	undo() {
		const entry = this.undoStack.pop()
		if (!entry) return

		entry.unselectTrees.forEach((tree) =>
			this.parent.removeSelectionOf(tree)
		)

		this.redoStack.push(entry.undo())
	}

	redo() {
		const entry = this.redoStack.pop()
		if (!entry) return

		entry.unselectTrees.forEach((tree) =>
			this.parent.removeSelectionOf(tree)
		)

		this.undoStack.push(entry.undo())
	}

	push(entry: HistoryEntry) {
		this.undoStack.push(entry)
		this.redoStack = []
	}
}
