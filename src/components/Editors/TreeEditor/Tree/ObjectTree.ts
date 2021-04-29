import { createTree } from './createTree'
import { Tree, treeElementHeight } from './Tree'
import ObjecTreeComponent from './CommonTree.vue'
import type { ArrayTree } from './ArrayTree'

export class ObjectTree extends Tree<object> {
	public component = ObjecTreeComponent
	public isOpen = false
	public readonly type = 'object'
	protected _children: Record<string, Tree<unknown>>

	constructor(
		parent: ObjectTree | ArrayTree | null,
		protected _value: object
	) {
		super(parent)
		this._children = Object.fromEntries(
			Object.entries(_value).map(([key, val]) => [
				key,
				createTree(this, val),
			])
		)
	}

	get height() {
		if (!this.isOpen) return treeElementHeight

		return (
			2 * treeElementHeight +
			Object.values(this._children).reduce(
				(prev, val) => prev + val.height,
				0
			)
		)
	}
	get children() {
		return this._children
	}

	toJSON() {
		return Object.fromEntries(
			Object.entries(this._children).map(([key, val]) => [
				key,
				val.toJSON(),
			])
		)
	}

	updatePropertyName(oldName: string, newName: string) {
		let oldTree = this.children[oldName]
		let newTree = this.children[newName]
		this.children[newName] = oldTree
		delete this.children[oldName]

		return {
			undo: () => {
				this.children[oldName] = oldTree
				this.children[newName] = newTree
			},
		}
	}
}
