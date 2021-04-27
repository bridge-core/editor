import Vue from 'vue'
import { v4 as uuid } from 'uuid'
export type TPrimitiveTree = string | number | boolean | null
export type TTree = TPrimitiveTree | Object | Array<unknown>

export abstract class Tree<T> {
	public readonly uuid = uuid()
	public abstract readonly component: Vue.Component
	public abstract type: TTree
	protected abstract _value: T
	abstract toJSON(): T

	constructor(protected parent: Tree<unknown> | null) {}

	get value() {
		return this._value
	}
}
