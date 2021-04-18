import { promises as fs } from 'fs'
import { buildSchemaScripts } from './buildSchemaScripts.mjs'
import { buildDynamicSchemas } from './buildDynamicSchemas.mjs'

export async function buildPackages() {
	const dirents = await fs.readdir('./data/packages', {
		withFileTypes: true,
	})

	for (const dirent of dirents) {
		if (!dirent.isDirectory()) continue
		console.log(dirent.name)

		await buildDynamicSchemas(dirent.name)
		await buildSchemaScripts(
			`data/packages/${dirent.name}/schemaScript`,
			dirent.name
		)
	}
}
