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
	private propertyIndex: number

	public constructor(public element: ObjectElement, public oldKey: string, public newKey: string) {
		this.propertyIndex = Object.keys(element.children).indexOf(oldKey)
	}

	public apply(): TreeSelection {
		const child = this.element.children[this.oldKey]

		delete this.element.children[this.oldKey]

		const keys = Object.keys(this.element.children)
		const values = Object.values(this.element.children)

		keys.splice(this.propertyIndex, 0, this.newKey)
		values.splice(this.propertyIndex, 0, child)

		this.element.children = Object.fromEntries(keys.map((key, index) => [key, values[index]]))

		child.key = this.newKey

		return { type: 'property', tree: child }
	}

	public undo(): TreeSelection {
		const child = this.element.children[this.newKey]

		delete this.element.children[this.newKey]

		const keys = Object.keys(this.element.children)
		const values = Object.values(this.element.children)

		keys.splice(this.propertyIndex, 0, this.oldKey)
		values.splice(this.propertyIndex, 0, child)

		this.element.children = Object.fromEntries(keys.map((key, index) => [key, values[index]]))

		child.key = this.oldKey

		return { type: 'property', tree: child }
	}
}

export class AddPropertyEdit implements TreeEdit {
	public constructor(public element: ObjectElement, public key: string, public value: TreeElements) {}

	public apply(): TreeSelection {
		this.element.children[this.key] = this.value

		return { type: 'property', tree: this.element }
	}

	public undo(): TreeSelection {
		delete this.element.children[this.key]

		return null
	}
}

export class AddElementEdit implements TreeEdit {
	public constructor(public element: ArrayElement, public value: TreeElements) {}

	public apply(): TreeSelection {
		this.element.children.push(this.value)

		return { type: 'value', tree: this.element }
	}

	public undo(): TreeSelection {
		this.element.children.pop()

		return null
	}
}

export class DeleteElementEdit implements TreeEdit {
	public oldPropertyIndex: number = -1

	public constructor(public element: TreeElements) {
		if (element.parent instanceof ObjectElement)
			this.oldPropertyIndex = Object.keys(element.parent.children).indexOf(element.key as string)
	}

	public apply(): TreeSelection {
		if (this.element.parent instanceof ObjectElement) {
			delete this.element.parent.children[this.element.key as string]
		}

		if (this.element.parent instanceof ArrayElement) {
			this.element.parent.children.splice(this.element.key as number, 1)

			for (let index = 0; index < this.element.parent.children.length; index++) {
				this.element.parent.children[index].key = index
			}
		}

		return null
	}

	public undo(): TreeSelection {
		if (this.element.parent instanceof ObjectElement) {
			this.element.parent.children[this.element.key as string] = this.element

			const keys = Object.keys(this.element.parent.children)
			const values = Object.values(this.element.parent.children)

			keys.splice(this.oldPropertyIndex, 0, this.element.key as string)
			values.splice(this.oldPropertyIndex, 0, this.element)

			this.element.parent.children = Object.fromEntries(keys.map((key, index) => [key, values[index]]))
		}

		if (this.element.parent instanceof ArrayElement) {
			this.element.parent.children.splice(this.element.key as number, 0, this.element)

			for (let index = 0; index < this.element.parent.children.length; index++) {
				this.element.parent.children[index].key = index
			}
		}

		return { type: 'value', tree: this.element }
	}
}

export class MoveEdit implements TreeEdit {
	private oldParent: ObjectElement | ArrayElement
	private oldPropertyIndex: number
	private oldKey: string | number
	private newKey: string | number

	public constructor(
		private element: TreeElements,
		private newParent: ObjectElement | ArrayElement,
		private newPropertyIndex: number
	) {
		if (!element.parent) throw new Error('Element must have a parent')
		if (element.key === null) throw new Error('Element must have a parent')

		this.oldParent = element.parent
		this.oldKey = element.key

		if (this.oldParent instanceof ObjectElement) {
			this.oldPropertyIndex = Object.keys(this.oldParent.children).indexOf(element.key as string)
		} else {
			this.oldPropertyIndex = element.key as number
		}

		if (this.newParent instanceof ObjectElement) {
			this.newKey = typeof this.oldKey === 'string' ? this.oldKey : 'new_property'

			console.log('new key', this.newKey)

			while (Object.keys(this.newParent.children).includes(this.newKey)) {
				this.newKey = 'new_' + this.newKey
			}
		} else {
			this.newKey = this.newPropertyIndex
		}
	}

	public apply(): TreeSelection {
		if (this.oldParent instanceof ObjectElement) {
			delete this.oldParent.children[this.element.key as string]
		} else {
			this.oldParent.children.splice(this.oldPropertyIndex, 1)

			for (let index = 0; index < this.oldParent.children.length; index++) {
				this.oldParent.children[index].key = index
			}
		}

		if (this.newParent instanceof ObjectElement) {
			const keys = Object.keys(this.newParent.children)
			const values = Object.values(this.newParent.children)

			keys.splice(this.newPropertyIndex, 0, this.newKey as string)
			values.splice(this.newPropertyIndex, 0, this.element)

			this.newParent.children = Object.fromEntries(keys.map((key, index) => [key, values[index]]))

			this.element.parent = this.newParent
			this.element.key = this.newKey

			return { type: 'property', tree: this.element }
		} else {
			this.newParent.children.splice(this.newPropertyIndex, 0, this.element)

			this.element.parent = this.newParent

			for (let index = 0; index < this.newParent.children.length; index++) {
				this.newParent.children[index].key = index
			}

			return { type: 'value', tree: this.element }
		}
	}

	public undo(): TreeSelection {
		if (this.newParent instanceof ObjectElement) {
			delete this.newParent.children[this.element.key as string]
		} else {
			this.newParent.children.splice(this.newPropertyIndex, 1)

			for (let index = 0; index < this.newParent.children.length; index++) {
				this.newParent.children[index].key = index
			}
		}

		if (this.oldParent instanceof ObjectElement) {
			const keys = Object.keys(this.oldParent.children)
			const values = Object.values(this.oldParent.children)

			keys.splice(this.oldPropertyIndex, 0, this.oldKey as string)
			values.splice(this.oldPropertyIndex, 0, this.element)

			this.oldParent.children = Object.fromEntries(keys.map((key, index) => [key, values[index]]))

			this.element.parent = this.oldParent
			this.element.key = this.oldKey

			return { type: 'property', tree: this.element }
		} else {
			this.oldParent.children.splice(this.oldPropertyIndex, 0, this.element)

			this.element.parent = this.oldParent

			for (let index = 0; index < this.oldParent.children.length; index++) {
				this.oldParent.children[index].key = index
			}

			return { type: 'value', tree: this.element }
		}
	}
}
