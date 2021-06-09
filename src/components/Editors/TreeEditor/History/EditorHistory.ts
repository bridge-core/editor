import type { TreeEditor } from '../TreeEditor'
import { CollectedEntry } from './CollectedEntry'
import type { HistoryEntry } from './HistoryEntry'
import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'

/**
 * Dispatches an event when the isUnsaved status of the editor changes:
 *
 * - false > tab contains no changes
 * - true > tab is unsaved
 */

export class EditorHistory extends EventDispatcher<boolean> {
	public readonly changed = new EventDispatcher<void>()
	protected undoStack: HistoryEntry[] = []
	protected redoStack: HistoryEntry[] = []
	protected lastUndoLength = 0

	constructor(protected parent: TreeEditor) {
		super()
	}

	get length() {
		return this.undoStack.length
	}

	updateHasChanges() {
		this.dispatch(this.undoStack.length !== this.lastUndoLength)
	}
	saveState() {
		this.lastUndoLength = this.undoStack.length
		this.updateHasChanges()
	}

	undo() {
		const entry = this.undoStack.pop()
		if (!entry) return

		entry.unselectTrees.forEach((tree) =>
			this.parent.removeSelectionOf(tree)
		)

		this.redoStack.push(entry.undo())

		this.updateHasChanges()
		this.changed.dispatch()
	}

	redo() {
		const entry = this.redoStack.pop()
		if (!entry) return

		entry.unselectTrees.forEach((tree) =>
			this.parent.removeSelectionOf(tree)
		)

		this.undoStack.push(entry.undo())

		this.updateHasChanges()
		this.changed.dispatch()
	}

	push(entry: HistoryEntry) {
		this.undoStack.push(entry)
		this.redoStack = []

		this.updateHasChanges()
		this.changed.dispatch()
	}

	pushAll(entries: HistoryEntry[]) {
		if (entries.length === 0) return
		else if (entries.length === 1) this.push(entries[0])
		else this.push(new CollectedEntry(entries))
	}
}
