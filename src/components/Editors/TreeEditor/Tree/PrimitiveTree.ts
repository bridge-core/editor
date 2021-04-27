import { Tree, TPrimitiveTree } from './Tree'
import PrimitiveTreeComponent from './PrimitiveTree.vue'

export class PrimitiveTree extends Tree<TPrimitiveTree> {
	public component = PrimitiveTreeComponent
	constructor(
		parent: Tree<unknown> | null,
		protected _value: TPrimitiveTree
	) {
		super(parent)
	}

	get type() {
		if (this.value === null) return 'null'
		return <'string' | 'number' | 'boolean'>typeof this.value
	}
	toJSON() {
		return this.value
	}
}
