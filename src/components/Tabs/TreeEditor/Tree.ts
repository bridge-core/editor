import { v4 as uuid } from 'uuid'

export class TreeElement {
	public id = uuid()

	public constructor(public parent: TreeElement | null) {}

	public clone(parent: TreeElement | null = null): TreeElement {
		throw new Error('Not implemented!')
	}
}

export class ObjectElement extends TreeElement {
	public children: Record<string, TreeElement> = {}

	public constructor(parent: TreeElement | null = null) {
		super(parent)
	}

	public clone(parent: TreeElement | null = null): ObjectElement {
		const clonedElement = new ObjectElement(parent)

		for (const key of Object.keys(this.children)) {
			clonedElement.children[key] = this.children[key].clone(clonedElement)
		}

		return clonedElement
	}
}

export class ArrayElement extends TreeElement {
	public children: TreeElement[] = []

	public constructor(parent: TreeElement | null = null) {
		super(parent)
	}

	public clone(parent: TreeElement | null = null): ArrayElement {
		const clonedElement = new ArrayElement(parent)

		for (let index = 0; index < this.children.length; index++) {
			clonedElement.children[index] = this.children[index].clone(clonedElement)
		}

		return clonedElement
	}
}

export class ValueElement extends TreeElement {
	public constructor(parent: TreeElement | null = null, public value: number | string | boolean | null) {
		super(parent)
	}

	public clone(parent: TreeElement | null = null): ValueElement {
		return new ValueElement(parent, JSON.parse(JSON.stringify(this.value)))
	}
}

export function buildTree(
	json: Object | number | string | boolean | null,
	parent: TreeElement | null = null
): TreeElement {
	if (Array.isArray(json)) {
		const element = new ArrayElement(parent)

		element.children = json.map((child, index) => buildTree(child, element))

		return element
	} else if (json === null) {
		return new ValueElement(parent, null)
	} else if (typeof json === 'object') {
		const element = new ObjectElement(parent)

		element.children = Object.fromEntries(
			Object.entries(json).map(([key, value]) => [key, buildTree(value, element)])
		)

		return element
	} else {
		return new ValueElement(parent, json)
	}
}

export interface TreeEdit {
	apply(): void

	undo(): void
}

export class ModifyValueEdit implements TreeEdit {
	private oldValue: number | string | boolean | null

	public constructor(public element: ValueElement, public value: number | string | boolean | null) {
		this.oldValue = element.value
	}

	public apply() {
		this.element.value = this.value
	}

	public undo() {
		this.element.value = this.oldValue
	}
}

export class ModifyPropertyKeyEdit implements TreeEdit {
	private oldKey: string
	private propertyIndex: number

	public constructor(public element: ObjectElement, public key: string, public newKey: string) {
		this.oldKey = key

		this.propertyIndex = Object.keys(element.children).indexOf(key)
	}

	public apply() {
		const child = this.element.children[this.oldKey]

		delete this.element.children[this.oldKey]

		const keys = Object.keys(this.element.children)
		const values = Object.values(this.element.children)

		keys.splice(this.propertyIndex, 0, this.newKey)
		values.splice(this.propertyIndex, 0, child)

		this.element.children = Object.fromEntries(keys.map((key, index) => [key, values[index]]))
	}

	public undo() {
		const child = this.element.children[this.newKey]

		delete this.element.children[this.newKey]

		const keys = Object.keys(this.element.children)
		const values = Object.values(this.element.children)

		keys.splice(this.propertyIndex, 0, this.oldKey)
		values.splice(this.propertyIndex, 0, child)

		this.element.children = Object.fromEntries(keys.map((key, index) => [key, values[index]]))
	}
}
