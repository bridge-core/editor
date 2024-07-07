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
	apply(tree: TreeElement): void

	undo(tree: TreeElement): void
}

export class ModifyValueEdit implements TreeEdit {
	private oldValue: number | string | boolean | null

	public constructor(public element: ValueElement, public value: number | string | boolean | null) {
		this.oldValue = element.value
	}

	public apply(tree: TreeElement) {
		this.element.value = this.value

		return tree
	}

	public undo(tree: TreeElement) {
		this.element.value = this.oldValue

		return tree
	}
}
