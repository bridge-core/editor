import { ArrayTree } from './Tree/ArrayTree'
import { PrimitiveTree } from './Tree/PrimitiveTree'
import { Tree } from './Tree/Tree'

export class TreeSelection {
	constructor(protected tree: Tree<unknown>) {
		tree.isSelected = true
	}

	getTree() {
		return this.tree
	}

	dispose() {
		this.tree.isSelected = false
	}

	edit(value: string) {
		const parent = this.tree.getParent()
		if (!parent) throw new Error(`Cannot edit property name without parent`)
		if (parent instanceof ArrayTree)
			throw new Error(`Cannot edit array indices`)

		// The tree key must be of type string because of the instanceof check above
		parent.updatePropertyName(<string>this.tree.key, value)
	}
}

export class TreeValueSelection {
	constructor(protected tree: PrimitiveTree) {
		tree.isValueSelected = true
	}

	getTree() {
		return this.tree
	}

	dispose() {
		this.tree.isValueSelected = false
	}

	edit(value: string) {
		this.tree.setValue(value)
	}
}
