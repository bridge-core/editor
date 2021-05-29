import { DeleteEntry } from './History/DeleteEntry'
import { ReplaceTreeEntry } from './History/ReplaceTree'
import { ArrayTree } from './Tree/ArrayTree'
import { ObjectTree } from './Tree/ObjectTree'
import { PrimitiveTree } from './Tree/PrimitiveTree'
import { TPrimitiveTree, Tree } from './Tree/Tree'
import type { TreeEditor } from './TreeEditor'

export class TreeSelection {
	constructor(
		protected parent: TreeEditor,
		protected tree: ArrayTree | ObjectTree
	) {
		tree.setIsSelected(true)
	}

	getTree() {
		return this.tree
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

		// The tree key must be of type string because of the instanceof check above
		parent.updatePropertyName(<string>this.tree.key, value)
	}

	addKey(key: string) {
		const newTree = new ObjectTree(this.tree, {})
		const index = this.tree.children.length

		this.tree.setOpen(true, true)

		if (this.tree instanceof ArrayTree) {
			this.tree.children.push(newTree)

			// Pushing a key to an array should add it inside of an object
			const keyTree = new ObjectTree(newTree, {})
			newTree.children.push([key, keyTree])

			this.select(keyTree)
			newTree.setOpen(true)
		} else {
			this.tree.children.push([key, newTree])
			this.select(newTree)
		}

		return new DeleteEntry(newTree, index, key)
	}

	addValue(value: TPrimitiveTree) {
		if (this.tree.type === 'array') {
			// Push primitive trees into array trees
			const newTree = new PrimitiveTree(this.tree, value)

			this.tree.children.push(newTree)
			this.parent.setSelection(newTree, true)
			this.dispose()

			return new DeleteEntry(newTree, this.tree.children.length - 1)
		} else if (Object.keys(this.tree.children).length === 0) {
			// Otherwise only add value to empty objects
			const newTree = new PrimitiveTree(this.tree.getParent(), value)

			this.tree.replace(newTree)
			this.parent.setSelection(newTree, true)
			this.dispose()

			return new ReplaceTreeEntry(this.tree, newTree)
		}
	}
}

export class TreeValueSelection {
	constructor(protected parent: TreeEditor, protected tree: PrimitiveTree) {
		tree.isValueSelected = true
	}

	getTree() {
		return this.tree
	}

	dispose(removeSel = true) {
		this.tree.isValueSelected = false
		if (removeSel) this.parent.removeSelection(this)
	}

	edit(value: string) {
		if (!Number.isNaN(Number(value))) this.tree.setValue(Number(value))
		else if (value === 'null') this.tree.setValue(null)
		else if (value === 'true' || value === 'false')
			this.tree.setValue(value === 'true')
		else this.tree.setValue(value)
	}
}
