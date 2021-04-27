import { createTree } from './createTree'
import { Tree } from './Tree'
import ArrayTreeComponent from './CommonTree.vue'

export class ArrayTree extends Tree<Array<unknown>> {
	public component = ArrayTreeComponent
	public isOpen = false
	public readonly type = 'array'
	protected children: Tree<unknown>[]

	constructor(
		parent: Tree<unknown> | null,
		protected _value: Array<unknown>
	) {
		super(parent)
		this.children = _value.map((val) => createTree(this, val))
	}
	toJSON() {
		return this.children.map((child) => child.toJSON())
	}
}
