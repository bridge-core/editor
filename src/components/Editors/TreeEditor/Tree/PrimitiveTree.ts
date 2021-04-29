import { Tree, TPrimitiveTree, treeElementHeight } from './Tree'
import PrimitiveTreeComponent from './PrimitiveTree.vue'
import type { ArrayTree } from './ArrayTree'
import type { ObjectTree } from './ObjectTree'

export class PrimitiveTree extends Tree<TPrimitiveTree> {
	public component = PrimitiveTreeComponent
	constructor(
		parent: ObjectTree | ArrayTree | null,
		protected _value: TPrimitiveTree
	) {
		super(parent)
	}

	get type() {
		if (this.value === null) return 'null'
		return <'string' | 'number' | 'boolean'>typeof this.value
	}
	get height() {
		return treeElementHeight
	}

	toJSON() {
		return this.value
	}
}
