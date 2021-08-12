import { HistoryEntry } from './HistoryEntry'

export class CollectedEntry extends HistoryEntry {
	constructor(protected entries: HistoryEntry[]) {
		super()
	}

	get unselectTrees() {
		return this.entries.map((entry) => entry.unselectTrees).flat()
	}

	undo() {
		return new CollectedEntry(
			this.entries.reverse().map((entry) => entry.undo())
		)
	}
}
