import { ArrayTree } from './Tree/ArrayTree'
import { ObjectTree } from './Tree/ObjectTree'
import { PrimitiveTree } from './Tree/PrimitiveTree'
import { TPrimitiveTree } from './Tree/Tree'
import type { TreeEditor } from './TreeEditor'

export class TreeSelection {
	constructor(
		protected parent: TreeEditor,
		protected tree: ArrayTree | ObjectTree
	) {
		tree.isSelected = true
	}

	getTree() {
		return this.tree
	}

	dispose(removeSel = true) {
		this.tree.isSelected = false
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
		if (this.tree instanceof ArrayTree) this.tree.children.push(newTree)
		else this.tree.children.push([key, newTree])

		this.tree.isSelected = false
		this.tree.isOpen = true
		newTree.isSelected = true
		this.tree = newTree
	}

	addValue(value: TPrimitiveTree) {
		if (Object.keys(this.tree.children).length > 0) return

		const newTree = new PrimitiveTree(this.tree.getParent(), value)
		this.parent.toggleSelection(this.tree, false)

		this.tree.replace(newTree)
		this.parent.setSelection(newTree, true)
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
