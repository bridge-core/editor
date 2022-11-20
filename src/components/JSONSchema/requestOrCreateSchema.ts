import { SchemaManager } from './Manager'
import { RootSchema } from './Schema/Root'

export function requestOrCreateSchema(fileUri: string) {
	let schema = SchemaManager.requestRootSchema(fileUri)
	if (schema) return schema

	const schemaDef = SchemaManager.request(fileUri)
	schema = new RootSchema(fileUri, '$global', schemaDef)
	SchemaManager.addRootSchema(fileUri, schema)

	return schema
}
