import { ArrayTree } from './Tree/ArrayTree'
import { createTree } from './Tree/createTree'
import { ObjectTree } from './Tree/ObjectTree'
import { PrimitiveTree } from './Tree/PrimitiveTree'
import { Tree } from './Tree/Tree'
import { TreeSelection, TreeValueSelection } from './TreeSelection'

export class TreeEditor {
	protected tree: Tree<unknown>
	protected selections: (TreeSelection | TreeValueSelection)[] = []

	constructor(protected json: unknown) {
		this.tree = createTree(null, json)
	}

	toJSON() {
		return this.tree.toJSON()
	}

	forEachSelection(
		cb: (selection: TreeSelection | TreeValueSelection) => void
	) {
		this.selections.forEach(cb)
	}

	setSelection(tree: Tree<unknown>, selectPrimitiveValue = false) {
		this.selections.forEach((selection) => selection.dispose())
		this.selections = [
			selectPrimitiveValue && tree instanceof PrimitiveTree
				? new TreeValueSelection(this, tree)
				: new TreeSelection(this, <ArrayTree | ObjectTree>tree),
		]
	}
	toggleSelection(tree: Tree<unknown>, selectPrimitiveValue = false) {
		let didRemoveSelection = false
		this.selections = this.selections.filter((selection) => {
			if (
				selection.getTree() !== tree ||
				selection instanceof TreeValueSelection !== selectPrimitiveValue
			)
				return true

			selection.dispose()
			didRemoveSelection = true
			return false
		})

		if (!didRemoveSelection)
			this.selections.push(
				selectPrimitiveValue && tree instanceof PrimitiveTree
					? new TreeValueSelection(this, tree)
					: new TreeSelection(this, <ArrayTree | ObjectTree>tree)
			)
	}
}
