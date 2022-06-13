import { requestOrCreateSchema } from '../requestOrCreateSchema'
import { Schema } from '../Schema/Schema'

export function toTypeDefinition(fileUri: string): [string, string] {
	const hoisted = new Set<Schema>()

	const definition = requestOrCreateSchema(fileUri)
		?.toTypeDefinition(hoisted)
		.toString()

	let hoistedDefinitions = new Set()

	for (const schema of hoisted) {
		hoistedDefinitions.add(
			schema.toTypeDefinition(hoisted, true)?.withName(schema.getName())
		)

		console.log(schema.getName(), schema.toTypeDefinition(hoisted, true))
	}

	return [[...hoistedDefinitions].join(''), definition]
}
