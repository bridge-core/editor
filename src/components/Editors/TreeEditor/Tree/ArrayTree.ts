import { createTree } from './createTree'
import { Tree, treeElementHeight } from './Tree'
import ArrayTreeComponent from './CommonTree.vue'
import type { ObjectTree } from './ObjectTree'

export class ArrayTree extends Tree<Array<unknown>> {
	public component = ArrayTreeComponent
	public isOpen = false
	public readonly type = 'array'
	protected _children: Tree<unknown>[]

	constructor(
		parent: ObjectTree | ArrayTree | null,
		protected _value: Array<unknown>
	) {
		super(parent)
		this._children = _value.map((val) => createTree(this, val))
	}

	get height() {
		if (!this.isOpen) return treeElementHeight

		return (
			2 * treeElementHeight +
			this._children.reduce((prev, val) => prev + val.height, 0)
		)
	}
	get children() {
		return this._children
	}

	toJSON() {
		return this._children.map((child) => child.toJSON())
	}
	updatePropertyName(oldIndex: number, newIndex: number) {
		let oldTree = this.children[oldIndex]
		let newTree = this.children[newIndex]
		this.children[newIndex] = oldTree
		delete this.children[oldIndex]

		return {
			undo: () => {
				this.children[oldIndex] = oldTree
				this.children[newIndex] = newTree
			},
		}
	}
}
