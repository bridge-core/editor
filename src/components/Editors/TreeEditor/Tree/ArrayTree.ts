import { createTree } from './createTree'
import { Tree, treeElementHeight } from './Tree'
import ArrayTreeComponent from './CommonTree.vue'
import type { ObjectTree } from './ObjectTree'
import { markRaw } from 'vue'

export class ArrayTree extends Tree<Array<unknown>> {
	public component = markRaw(ArrayTreeComponent)
	public _isOpen = false
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
	get hasChildren() {
		return this._children.length > 0
	}
	get isOpen() {
		if (!this.hasChildren) return false
		return this._isOpen
	}

	get(path: (string | number)[]) {
		if (path.length === 0) return this

		const currentKey = path.shift()
		if (typeof currentKey !== 'number') return null

		const child = this.children[currentKey]

		if (!child) return null

		return child.get(path)
	}

	hasChild(child: Tree<unknown>) {
		return this.children.includes(child)
	}
	addChild(child: Tree<unknown>) {
		this._children.push(child)
	}

	setOpen(val: boolean, force = false) {
		if (this.hasChildren || force) this._isOpen = val
	}
	toggleOpen() {
		this.setOpen(!this._isOpen)
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
