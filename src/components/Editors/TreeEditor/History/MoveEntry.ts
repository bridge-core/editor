import { ArrayTree } from '../Tree/ArrayTree'
import { ObjectTree } from '../Tree/ObjectTree'
import { Tree } from '../Tree/Tree'
import { HistoryEntry } from './HistoryEntry'

export class MoveEntry extends HistoryEntry {
	unselectTrees: Tree<unknown>[] = []

	constructor(
		protected oldParent: ArrayTree | ObjectTree,
		protected tree: Tree<unknown>,
		protected index: number,
		protected key = ''
	) {
		super()

		this.unselectTrees = [this.tree]
	}

	undo() {
		const parent = this.tree.getParent()

		if (!parent)
			throw new Error(
				`Invalid state: Undo delete action on global tree node`
			)

		const oldIndex = this.tree.findParentIndex()
		this.tree.delete()

		if (this.oldParent.type === 'array')
			this.oldParent.children.splice(this.index, 0, this.tree)
		else
			this.oldParent.children.splice(this.index, 0, [this.key, this.tree])

		this.tree.getParent()?.requestValidation()
		this.tree.setParent(this.oldParent)
		this.oldParent.requestValidation()

		return new MoveEntry(parent, this.tree, oldIndex, this.key)
	}
}
