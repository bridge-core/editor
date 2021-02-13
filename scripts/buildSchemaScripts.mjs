import { dirname, join } from 'path'
import { promises as fs } from 'fs'
import json5 from 'json5'

export async function runSchemaScripts() {
	const dirents = await fs.readdir('./data/schemaScript', {
		withFileTypes: true,
	})

	for (const dirent of dirents) {
		if (!dirent.isFile()) continue

		const schemaScriptDef = json5.parse(
			await fs.readFile(join('./data/schemaScript', dirent.name))
		)
		let schema
		if (schemaScriptDef.type === 'enum') {
			schema = {
				$schema: 'http://json-schema.org/draft-07/schema',
				type: 'string',
				enum: [],
			}
		} else if (schemaScriptDef.type === 'properties') {
			schema = {
				$schema: 'http://json-schema.org/draft-07/schema',
				type: 'object',
				properties: {},
			}
		}

		if (!schema) continue
		await fs.mkdir(
			dirname(join('./data/schema', schemaScriptDef.generateFile)),
			{ recursive: true }
		)
		await fs.writeFile(
			join('./data/schema', schemaScriptDef.generateFile),
			JSON.stringify(schema)
		)
	}
}
