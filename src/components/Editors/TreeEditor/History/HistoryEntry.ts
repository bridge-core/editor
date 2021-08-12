import type { Tree } from '../Tree/Tree'

export abstract class HistoryEntry {
	public abstract readonly unselectTrees: Tree<unknown>[]
	abstract undo(): HistoryEntry
}
