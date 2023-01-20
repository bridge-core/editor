import { Tree } from '../Tree/Tree'
import { HistoryEntry } from './HistoryEntry'

export class ReplaceTreeEntry extends HistoryEntry {
	unselectTrees: Tree<unknown>[]

	constructor(
		protected oldTree: Tree<unknown>,
		protected newTree: Tree<unknown>
	) {
		super()
		this.unselectTrees = [newTree, oldTree]
	}

	undo() {
		this.newTree.replace(this.oldTree)

		return new ReplaceTreeEntry(this.newTree, this.oldTree)
	}
}
