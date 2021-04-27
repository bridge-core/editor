import { createTree } from './createTree'
import { Tree } from './Tree'
import ObjecTreeComponent from './CommonTree.vue'

export class ObjectTree extends Tree<object> {
	public component = ObjecTreeComponent
	public isOpen = false
	public readonly type = 'object'
	protected children: Record<string, Tree<unknown>>

	constructor(parent: Tree<unknown> | null, protected _value: object) {
		super(parent)
		this.children = Object.fromEntries(
			Object.entries(_value).map(([key, val]) => [
				key,
				createTree(this, val),
			])
		)
	}
	toJSON() {
		return Object.fromEntries(
			Object.entries(this.children).map(([key, val]) => [
				key,
				val.toJSON(),
			])
		)
	}
}
