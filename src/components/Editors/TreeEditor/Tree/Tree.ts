import { set } from 'vue'
import { v4 as uuid } from 'uuid'
import type { ArrayTree } from './ArrayTree'
import type { ObjectTree } from './ObjectTree'
import { pointerDevice } from '/@/utils/pointerDevice'
import type { TreeEditor } from '../TreeEditor'
import { IDiagnostic } from '/@/components/JSONSchema/Schema/Schema'
import { whenIdle } from '/@/utils/whenIdle'
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
	protected parent: ObjectTree | ArrayTree | null = null
	protected _treeEditor: TreeEditor | null = null
	protected diagnostics: IDiagnostic[] = []

	constructor(parent: ObjectTree | ArrayTree | TreeEditor | null) {
		if (parent?.type === 'treeEditor') {
			this.parent = null
			this._treeEditor = parent
		} else {
			this.parent = <ObjectTree | ArrayTree | null>parent
		}
	}

	get value() {
		return this._value
	}
	getParent() {
		return this.parent
	}
	setParent(parent: ObjectTree | ArrayTree | null) {
		this.parent = parent

		this.parent?.requestValidation()
	}
	get treeEditor(): TreeEditor {
		if (this._treeEditor) return this._treeEditor
		if (!this.parent) throw new Error(`Tree has no parent or treeEditor`)
		return this.parent.treeEditor
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

		this.parent.requestValidation()
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

		this.parent.requestValidation()

		return <const>[index, Array.isArray(deleted) ? deleted[0] : '']
	}

	validate() {
		let hadDiagnostics = this.diagnostics.length > 0

		this.diagnostics = this.treeEditor
			.getSchemas(this)
			.map((schema) => schema.validate(this.toJSON()))
			.flat()

		// There are two cases in which we need to clear the parent's cache:
		// 1. We had diagnostics and now we don't
		// 2. We didn't have diagnostics and now we do
		if (
			(!hadDiagnostics && this.diagnostics.length > 0) ||
			(hadDiagnostics && this.diagnostics.length === 0)
		) {
			this.clearParentDiagnosticsCache()
		} else {
			// Otherwise, we can just clear our own cache
			this.clearDiagnosticsCache()
		}
	}
	requestValidation() {
		whenIdle(() => this.validate())
	}

	protected _cachedHighestSeverityDiagnostic: IDiagnostic | undefined | null =
		null
	get highestSeverityDiagnostic() {
		if (this._cachedHighestSeverityDiagnostic !== null)
			return this._cachedHighestSeverityDiagnostic

		let highestSeverity: IDiagnostic | undefined = undefined

		for (const diagnostic of this.diagnostics) {
			if (diagnostic.severity === 'error') {
				this._cachedHighestSeverityDiagnostic = diagnostic
				return diagnostic
			} else if (
				diagnostic.severity === 'warning' &&
				(!highestSeverity || highestSeverity.severity === 'info')
			)
				highestSeverity = diagnostic
			else if (!highestSeverity) highestSeverity = diagnostic
		}

		this._cachedHighestSeverityDiagnostic = highestSeverity
		return highestSeverity
	}

	clearDiagnosticsCache() {
		this._cachedHighestSeverityDiagnostic = null
	}
	clearParentDiagnosticsCache() {
		this.clearDiagnosticsCache()
		this.parent?.clearParentDiagnosticsCache()
	}
}
