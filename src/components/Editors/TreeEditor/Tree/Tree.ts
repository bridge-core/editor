import { v4 as uuid } from 'uuid'
import type { ArrayTree } from './ArrayTree'
import type { ObjectTree } from './ObjectTree'
export type TPrimitiveTree = string | number | boolean | null
export type TTree = TPrimitiveTree | Object | Array<unknown>

export const treeElementHeight = 19

export abstract class Tree<T> {
	public readonly uuid = uuid()
	public abstract readonly component: Vue.Component
	public abstract type: TTree
	public abstract height: number
	protected abstract _value: T
	abstract toJSON(): T

	get styles() {
		return {
			contentVisibility: 'auto',
			containIntrinsicSize: `${this.height}px`,
		}
	}

	constructor(protected parent: ObjectTree | ArrayTree | null) {}

	get value() {
		return this._value
	}
}
