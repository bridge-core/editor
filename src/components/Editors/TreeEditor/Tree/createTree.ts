import { ObjectTree } from './ObjectTree'
import { Tree } from './Tree'
import { ArrayTree } from './ArrayTree'
import { PrimitiveTree } from './PrimitiveTree'

export function createTree(
	parent: ObjectTree | ArrayTree | null,
	value: unknown
): Tree<unknown> {
	if (value === null) return new PrimitiveTree(parent, null)
	else if (Array.isArray(value)) return new ArrayTree(parent, value)
	else if (typeof value === 'object') return new ObjectTree(parent, value!)
	else if (['string', 'number', 'boolean'].includes(typeof value))
		return new PrimitiveTree(parent, <string | number | boolean>value)
	else
		throw new Error(`Undefined type handler: "${typeof value}" -> ${value}`)
}
