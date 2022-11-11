import { set } from 'vue'
import { v4 as uuid } from 'uuid'
import type { ArrayTree } from './ArrayTree'
import type { ObjectTree } from './ObjectTree'
import { pointerDevice } from '/@/utils/pointerDevice'
export type TPrimitiveTree = string | number | boolean | null
export type TTree = TPrimitiveTree | Object | Array<unknown>

export const treeElementHeight = pointerDevice.value === 'mouse' ? 19 : 26

export abstract class Tree<T> {
	public readonly uuid = uuid()
	public abstract readonly component: Vue.Component
	protected isSelected: boolean = false
	public abstract type: TTree
	public abstract height: number
	protected abstract _value: T
	abstract toJSON(): T

	constructor(protected parent: ObjectTree | ArrayTree | null) {}

	get value() {
		return this._value
	}
	getParent() {
		return this.parent
	}
	setParent(parent: ObjectTree | ArrayTree | null) {
		this.parent = parent
	}
	get path(): (string | number)[] {
		if (!this.parent) return []
		else return [...this.parent.path, this.key]
	}

	abstract get(path: (string | number)[]): Tree<unknown> | null

	findParentIndex() {
		if (!this.parent)
			throw new Error(`Cannot findParentIndex for tree without parent`)

		let index: number

		if (this.parent.type === 'array') {
			index = this.parent.children.findIndex(
				(currentTree) => currentTree === this
			)
		} else {
			index = this.parent.children.findIndex(
				([_, currentTree]) => currentTree === this
			)
		}

		if (index === -1) {
			console.log(this)
			throw new Error(
				`Invalid state: TreeChild with parent couldn't be found inside of parent's children`
			)
		}

		return index
	}

	get key(): string | number {
		if (!this.parent)
			throw new Error(`Trees without parent do not have a key`)

		const parentIndex = this.findParentIndex()

		return this.parent.type === 'array'
			? parentIndex
			: this.parent.children[parentIndex][0]
	}

	setIsSelected(val: boolean) {
		this.isSelected = val
	}

	replace(tree: Tree<unknown>) {
		if (!this.parent) throw new Error(`Cannot replace tree without parent`)

		const index = this.findParentIndex()

		set(
			this.parent.children,
			index,
			this.parent.type === 'array' ? tree : [this.key, tree]
		)
	}

	delete() {
		if (!this.parent) throw new Error(`Cannot delete tree without parent`)

		let index: number
		if (this.parent.type === 'array') {
			index = this.parent.children.findIndex(
				(currentTree) => currentTree === this
			)

			if (index === -1)
				throw new Error(
					`Invalid state: TreeChild with parent couldn't be found inside of parent's children`
				)
		} else {
			index = this.parent.children.findIndex(
				([_, currentTree]) => currentTree === this
			)

			if (index === -1)
				throw new Error(
					`Invalid state: TreeChild with parent couldn't be found inside of parent's children`
				)
		}

		const [deleted] = this.parent.children.splice(index, 1)

		return <const>[index, Array.isArray(deleted) ? deleted[0] : '']
	}
}
