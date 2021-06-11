import { ObjectTree } from '../Tree/ObjectTree'
import { PrimitiveTree } from '../Tree/PrimitiveTree'
import { Tree } from '../Tree/Tree'
import { HistoryEntry } from './HistoryEntry'

export class EditValueEntry extends HistoryEntry {
	unselectTrees: Tree<unknown>[]

	constructor(protected tree: PrimitiveTree, protected value: any) {
		super()
		this.unselectTrees = [tree]
	}

	undo() {
		const oldValue = `${this.tree.value}`

		this.tree.edit(this.value)

		return new EditValueEntry(this.tree, oldValue)
	}
}
