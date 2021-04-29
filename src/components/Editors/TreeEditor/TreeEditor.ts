import { createTree } from './Tree/createTree'
import { Tree } from './Tree/Tree'
import { TreeSelection } from './TreeSelection'

export class TreeEditor {
	protected tree: Tree<unknown>
	protected selections: TreeSelection[] = []

	constructor(protected json: unknown) {
		this.tree = createTree(null, json)
	}

	toJSON() {
		return this.tree.toJSON()
	}

	setSelection(tree: Tree<unknown>) {
		this.selections = [new TreeSelection(tree)]
	}
	addSelection(tree: Tree<unknown>) {
		this.selections.push(new TreeSelection(tree))
	}
}
