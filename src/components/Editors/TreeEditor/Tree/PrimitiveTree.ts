import { Tree, TPrimitiveTree, treeElementHeight } from './Tree'
import PrimitiveTreeComponent from './PrimitiveTree.vue'
import type { ArrayTree } from './ArrayTree'
import type { ObjectTree } from './ObjectTree'

export class PrimitiveTree extends Tree<TPrimitiveTree> {
	public component = PrimitiveTreeComponent
	public isValueSelected = false

	constructor(
		parent: ObjectTree | ArrayTree | null,
		protected _value: TPrimitiveTree
	) {
		super(parent)
	}

	get type() {
		if (this.value === null) return 'null'
		return <'string' | 'number' | 'boolean'>typeof this.value
	}
	get height() {
		return treeElementHeight
	}

	setValue(value: TPrimitiveTree) {
		this._value = value
	}

	toJSON() {
		return this.value
	}

	edit(value: string) {
		if (!Number.isNaN(Number(value))) this.setValue(Number(value))
		else if (value === 'null') this.setValue(null)
		else if (value === 'true' || value === 'false')
			this.setValue(value === 'true')
		else this.setValue(value)
	}
}
