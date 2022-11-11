import { CollectedEntry } from './History/CollectedEntry'
import { DeleteEntry } from './History/DeleteEntry'
import { EditPropertyEntry } from './History/EditPropertyEntry'
import { EditValueEntry } from './History/EditValueEntry'
import type { HistoryEntry } from './History/HistoryEntry'
import { ReplaceTreeEntry } from './History/ReplaceTree'
import { ArrayTree } from './Tree/ArrayTree'
import { ObjectTree } from './Tree/ObjectTree'
import { PrimitiveTree } from './Tree/PrimitiveTree'
import type { TPrimitiveTree } from './Tree/Tree'
import type { TreeEditor } from './TreeEditor'

export class TreeSelection {
	constructor(
		protected parent: TreeEditor,
		protected tree: ArrayTree | ObjectTree | PrimitiveTree
	) {
		tree.setIsSelected(true)
	}

	getTree() {
		return this.tree
	}
	getLocation() {
		return this.tree.path.join('/')
	}

	select(tree: ArrayTree | ObjectTree) {
		this.tree.setIsSelected(false)
		this.tree = tree
		this.tree.setIsSelected(true)
	}

	dispose(removeSel = true) {
		this.tree.setIsSelected(false)
		if (removeSel) this.parent.removeSelection(this)
	}

	edit(value: string) {
		const parent = this.tree.getParent()
		if (!parent) throw new Error(`Cannot edit property name without parent`)
		if (parent instanceof ArrayTree)
			throw new Error(`Cannot edit array indices`)

		const key = <string>this.tree.key
		// The tree key must be of type string because of the instanceof check above
		parent.updatePropertyName(key, value)

		return new EditPropertyEntry(parent, key, value)
	}

	addKey(key: string, type: 'array' | 'object') {
		if (this.tree instanceof PrimitiveTree) return

		const index = this.tree.children.length
		const historyEntries: HistoryEntry[] = []

		this.tree.setOpen(true, true)

		let addToTree = <ObjectTree>this.tree
		const newTree =
			type === 'object'
				? new ObjectTree(addToTree, {})
				: new ArrayTree(addToTree, [])

		if (this.tree instanceof ArrayTree) {
			// Pushing a key to an array should add it inside of an object
			addToTree = new ObjectTree(this.tree, {})
			// Make sure to update parent reference before adding tree as child
			newTree.setParent(addToTree)

			this.tree.children.push(addToTree)
			addToTree.setOpen(true, true)
		}

		addToTree.children.push([key, newTree])
		this.parent.setSelection(newTree)

		this.tree.setOpen(true, true)
		newTree.setOpen(true, true)

		if (this.tree instanceof ArrayTree) {
			historyEntries.push(new DeleteEntry(addToTree, index))
		} else {
			historyEntries.push(new DeleteEntry(newTree, index, key))
		}

		return new CollectedEntry(historyEntries)
	}

	addValue(value: TPrimitiveTree, type: 'value') {
		const historyEntries: HistoryEntry[] = []
		if (this.tree instanceof PrimitiveTree && !this.tree.isEmpty()) return

		if (this.tree.type === 'array') {
			// Push primitive trees into array trees
			const newTree = new PrimitiveTree(this.tree, value)

			this.tree.children.push(newTree)
			this.parent.setSelection(this.tree)

			historyEntries.push(
				new DeleteEntry(newTree, this.tree.children.length - 1)
			)

			this.tree.setOpen(true)
		} else if (
			this.tree instanceof PrimitiveTree ||
			this.tree.children.length === 0
		) {
			// Otherwise only add value to empty objects
			const newTree = new PrimitiveTree(this.tree.getParent(), value)

			this.tree.replace(newTree)
			this.parent.setSelection(newTree.getParent()!)
			this.dispose()

			historyEntries.push(new ReplaceTreeEntry(this.tree, newTree))
		}

		return new CollectedEntry(historyEntries)
	}
}

export class TreeValueSelection {
	constructor(protected parent: TreeEditor, protected tree: PrimitiveTree) {
		tree.isValueSelected = true
	}

	getTree() {
		return this.tree
	}
	getLocation() {
		return this.tree.path.join('/')
	}

	dispose(removeSel = true) {
		this.tree.isValueSelected = false
		if (removeSel) this.parent.removeSelection(this)
	}

	edit(value: string) {
		const oldValue = `${this.tree.value}`

		this.tree.edit(value)

		return new EditValueEntry(this.tree, oldValue)
	}
}
