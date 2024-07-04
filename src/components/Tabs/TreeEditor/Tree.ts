export class TreeElement {
	public constructor(public parent: TreeElement | null) {}
}

export class ObjectElement extends TreeElement {
	public children: Record<string, TreeElement> = {}

	public constructor(parent: TreeElement | null) {
		super(parent)
	}
}

export class ArrayElement extends TreeElement {
	public children: TreeElement[] = []
	public constructor(parent: TreeElement | null) {
		super(parent)
	}
}

export class ValueElement extends TreeElement {
	public constructor(parent: TreeElement | null, public value: number | string | boolean | null) {
		super(parent)
	}
}

export function buildTree(
	json: Object | number | string | boolean | null,
	parent: TreeElement | null = null
): TreeElement {
	if (Array.isArray(json)) {
		const element = new ArrayElement(parent)

		element.children = json.map((child) => buildTree(child, element))

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
