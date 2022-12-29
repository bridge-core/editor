import { Tree } from '../Tree/Tree'
import { HistoryEntry } from './HistoryEntry'

export class UndoDeleteEntry extends HistoryEntry {
	unselectTrees: Tree<unknown>[] = []

	constructor(
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

		if (parent.type === 'array')
			parent.children.splice(this.index, 0, this.tree)
		else parent.children.splice(this.index, 0, [this.key, this.tree])

		parent.requestValidation()

		return new DeleteEntry(this.tree, this.index, this.key)
	}
}

export class DeleteEntry extends HistoryEntry {
	unselectTrees: Tree<unknown>[] = []

	constructor(
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
				`Invalid state: Redo delete action on global tree node`
			)

		parent.children.splice(this.index, 1)
		parent.requestValidation()

		return new UndoDeleteEntry(this.tree, this.index, this.key)
	}
}
