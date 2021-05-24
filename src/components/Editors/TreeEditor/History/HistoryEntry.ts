export abstract class HistoryEntry {
	abstract undo(): HistoryEntry
}
