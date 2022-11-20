import { createTree } from './createTree'
import { Tree, treeElementHeight } from './Tree'
import ObjecTreeComponent from './CommonTree.vue'
import type { ArrayTree } from './ArrayTree'
import { set, del, markRaw } from 'vue'

export class ObjectTree extends Tree<object> {
	public component = markRaw(ObjecTreeComponent)
	public _isOpen = false
	public readonly type = 'object'
	protected _children: [string, Tree<unknown>][]

	constructor(
		parent: ObjectTree | ArrayTree | null,
		protected _value: object
	) {
		super(parent)
		this._children = Object.entries(_value).map(([key, val]) => [
			key,
			createTree(this, val),
		])
	}

	get height() {
		if (!this.isOpen) return treeElementHeight

		return (
			2 * treeElementHeight +
			this._children.reduce((prev, [_, val]) => prev + val.height, 0)
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

	get(path: (string | number)[]): Tree<unknown> | null {
		if (path.length === 0) return this

		const currentKey = path.shift()

		const [_, child] =
			this.children.find(([key]) => key === currentKey) ?? []

		if (!child) return null

		return child.get(path)
	}

	hasChild(child: Tree<unknown>) {
		return this.children.some(([_, currChild]) => currChild === child)
	}
	addChild(key: string, child: Tree<unknown>) {
		this._children.push([key, child])
	}

	setOpen(val: boolean, force = false) {
		if (this.hasChildren || force) this._isOpen = val
	}
	toggleOpen() {
		this.setOpen(!this._isOpen)
	}

	toJSON() {
		return Object.fromEntries(
			this._children.map(([key, val]) => [key, val.toJSON()])
		)
	}

	updatePropertyName(oldName: string, newName: string) {
		const oldIndex = this.children.findIndex(
			(child) => child[0] === oldName
		)
		let [_, oldTree] = this.children[oldIndex]
		if (!oldTree) return

		let i = 0
		let namePart1 = newName
		let index = this.children.findIndex((child) => child[0] === newName)
		if (index !== oldIndex) {
			while (index !== -1) {
				index = this.children.findIndex((child) => child[0] === newName)
				newName = namePart1 + `_${i++}`
			}
		}

		set(this.children, oldIndex, [newName, oldTree])
	}
}
