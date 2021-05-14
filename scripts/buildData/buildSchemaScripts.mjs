import { dirname, join } from 'path'
import { promises as fs } from 'fs'
import { readJson, writeJson } from '../common/jsonFs.mjs'

export async function buildSchemaScripts(directory, packageName) {
	const dirents = await fs
		.readdir(directory, {
			withFileTypes: true,
		})
		.catch(() => [])

	for (const dirent of dirents) {
		if (dirent.isDirectory()) {
			await buildSchemaScripts(join(directory, dirent.name), packageName)
			continue
		} else if (!dirent.isFile()) continue

		if (dirent.name.endsWith('.js')) continue

		let schemaScriptDef = await readJson(join(directory, dirent.name))

		let schema
		if (schemaScriptDef.type === 'enum') {
			schema = {
				$schema: 'http://json-schema.org/draft-07/schema',
				type: 'string',
				enum: [],
			}
		} else if (schemaScriptDef.type === 'object') {
			schema = {
				$schema: 'http://json-schema.org/draft-07/schema',
				type: 'object',
				properties: {},
			}
		}

		if (!schema) continue
		await fs.mkdir(
			dirname(
				join(
					`./data/packages/${packageName}/schema`,
					schemaScriptDef.generateFile
				)
			),
			{ recursive: true }
		)
		await writeJson(
			join(
				`./data/packages/${packageName}/schema`,
				schemaScriptDef.generateFile
			),
			schema
		)
	}
}
