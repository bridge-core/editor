import { v4 as uuid } from 'uuid'

export type TreeElements = ObjectElement | ArrayElement | ValueElement
export type ParentElements = ObjectElement | ArrayElement | null

abstract class TreeElement {
	public id = uuid()

	public constructor(public parent: ParentElements, public key: string | number | null) {}

	public abstract toJson(): any

	public abstract clone(parent: ParentElements): TreeElements
}

export class ObjectElement extends TreeElement {
	public children: Record<string, TreeElements> = {}

	public constructor(parent: ParentElements = null, public key: string | number | null = null) {
		super(parent, key)
	}

	public toJson(): any {
		return Object.fromEntries(Object.entries(this.children).map(([key, child]) => [key, child.toJson()]))
	}

	public clone(parent: ParentElements = null): ObjectElement {
		const clonedElement = new ObjectElement(parent)

		for (const key of Object.keys(this.children)) {
			clonedElement.children[key] = this.children[key].clone(clonedElement)
		}

		return clonedElement
	}
}

export class ArrayElement extends TreeElement {
	public children: TreeElements[] = []

	public constructor(parent: ParentElements = null, public key: string | number | null = null) {
		super(parent, key)
	}

	public toJson(): any {
		return this.children.map((child) => child.toJson())
	}

	public clone(parent: ParentElements = null): ArrayElement {
		const clonedElement = new ArrayElement(parent)

		for (let index = 0; index < this.children.length; index++) {
			clonedElement.children[index] = this.children[index].clone(clonedElement)
		}

		return clonedElement
	}
}

export class ValueElement extends TreeElement {
	public constructor(
		parent: ParentElements = null,
		public key: string | number | null = null,
		public value: number | string | boolean | null
	) {
		super(parent, key)
	}

	public toJson(): any {
		return this.value
	}

	public clone(parent: ParentElements = null): ValueElement {
		return new ValueElement(parent, this.key, JSON.parse(JSON.stringify(this.value)))
	}
}

export function buildTree(
	json: Object | number | string | boolean | null,
	parent: ParentElements = null,
	key: string | number | null = null
): TreeElements {
	if (Array.isArray(json)) {
		const element = new ArrayElement(parent, key)

		element.children = json.map((child, index) => buildTree(child, element, index))

		return element
	} else if (json === null) {
		return new ValueElement(parent, key, null)
	} else if (typeof json === 'object') {
		const element = new ObjectElement(parent, key)

		element.children = Object.fromEntries(
			Object.entries(json).map(([key, value]) => [key, buildTree(value, element, key)])
		)

		return element
	} else {
		return new ValueElement(parent, key, json)
	}
}

export type TreeSelection = { type: 'value' | 'property'; tree: TreeElements } | null

export interface TreeEdit {
	apply(): TreeSelection

	undo(): TreeSelection
}

export class ModifyValueEdit implements TreeEdit {
	private oldValue: number | string | boolean | null

	public constructor(public element: ValueElement, public value: number | string | boolean | null) {
		this.oldValue = element.value
	}

	public apply(): TreeSelection {
		this.element.value = this.value

		return { type: 'value', tree: this.element }
	}

	public undo(): TreeSelection {
		this.element.value = this.oldValue

		return { type: 'value', tree: this.element }
	}
}

export class ModifyPropertyKeyEdit implements TreeEdit {
	private oldKey: string
	private propertyIndex: number

	public constructor(public element: ObjectElement, public key: string, public newKey: string) {
		this.oldKey = key

		this.propertyIndex = Object.keys(element.children).indexOf(key)
	}

	public apply(): TreeSelection {
		const child = this.element.children[this.oldKey]

		delete this.element.children[this.oldKey]

		const keys = Object.keys(this.element.children)
		const values = Object.values(this.element.children)

		keys.splice(this.propertyIndex, 0, this.newKey)
		values.splice(this.propertyIndex, 0, child)

		this.element.children = Object.fromEntries(keys.map((key, index) => [key, values[index]]))

		return { type: 'value', tree: this.element }
	}

	public undo(): TreeSelection {
		const child = this.element.children[this.newKey]

		delete this.element.children[this.newKey]

		const keys = Object.keys(this.element.children)
		const values = Object.values(this.element.children)

		keys.splice(this.propertyIndex, 0, this.oldKey)
		values.splice(this.propertyIndex, 0, child)

		this.element.children = Object.fromEntries(keys.map((key, index) => [key, values[index]]))

		return { type: 'value', tree: this.element }
	}
}

export class AddPropertyEdit implements TreeEdit {
	public constructor(public element: ObjectElement, public key: string, public value: TreeElements) {}

	public apply(): TreeSelection {
		this.element.children[this.key] = this.value

		return { type: 'value', tree: this.element }
	}

	public undo(): TreeSelection {
		delete this.element.children[this.key]

		return null
	}
}

export class MovePropertyKeyEdit implements TreeEdit {
	private oldPropertyIndex: number

	public constructor(
		private oldParent: ObjectElement,
		private key: string,
		private newParent: ObjectElement,
		private newPropertyIndex: number
	) {
		this.oldPropertyIndex = Object.keys(oldParent.children).indexOf(key)
	}

	public apply(): TreeSelection {
		const child = this.oldParent.children[this.key]

		delete this.oldParent.children[this.key]

		const keys = Object.keys(this.newParent.children)
		const values = Object.values(this.newParent.children)

		keys.splice(this.newPropertyIndex, 0, this.key)
		values.splice(this.newPropertyIndex, 0, child)

		this.newParent.children = Object.fromEntries(keys.map((key, index) => [key, values[index]]))

		child.parent = this.newParent

		return { type: 'value', tree: child }
	}

	public undo(): TreeSelection {
		const child = this.newParent.children[this.key]

		delete this.newParent.children[this.key]

		const keys = Object.keys(this.oldParent.children)
		const values = Object.values(this.oldParent.children)

		keys.splice(this.oldPropertyIndex, 0, this.key)
		values.splice(this.oldPropertyIndex, 0, child)

		this.oldParent.children = Object.fromEntries(keys.map((key, index) => [key, values[index]]))

		child.parent = this.oldParent

		return { type: 'value', tree: child }
	}
}
