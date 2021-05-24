import { Tree } from '../Tree/Tree'
import { HistoryEntry } from './HistoryEntry'

export class UndoDeleteEntry extends HistoryEntry {
	constructor(
		protected tree: Tree<unknown>,
		protected index: number,
		protected key = ''
	) {
		super()
	}

	undo() {
		const parent = this.tree.getParent()

		if (!parent)
			throw new Error(
				`Invalid state: Undo delete action on global tree node`
			)

		if (parent.type === 'array')
			parent.children.splice(this.index, 0, this.tree)
		else parent.children.splice(this.index, 0, [this.key, this.tree])

		return new DeleteEntry(this.tree, this.index, this.key)
	}
}

export class DeleteEntry extends HistoryEntry {
	constructor(
		protected tree: Tree<unknown>,
		protected index: number,
		protected key = ''
	) {
		super()
	}

	undo() {
		const parent = this.tree.getParent()

		if (!parent)
			throw new Error(
				`Invalid state: Redo delete action on global tree node`
			)

		parent.children.splice(this.index, 1)

		return new UndoDeleteEntry(this.tree, this.index, this.key)
	}
}
