import { ArrayTree } from './Tree/ArrayTree'
import { PrimitiveTree } from './Tree/PrimitiveTree'
import { Tree } from './Tree/Tree'

export class TreeSelection {
	constructor(protected tree: Tree<unknown>) {
		tree.isSelected = true
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

export class TreeValueSelection extends TreeSelection {
	edit(value: string) {
		if (!(this.tree instanceof PrimitiveTree))
			throw new Error(
				`Cannot create value selection for non-primitive type.`
			)

		this.tree.setValue(value)
	}
}
