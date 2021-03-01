import JSON5 from 'json5'
import { join, basename } from 'path'
import { promises as fs } from 'fs'
import { loadFileDefs } from './loadFileDefs.mjs'

export async function buildDynamicSchemas() {
	const fileDefs = await loadFileDefs()

	for (const { lightningCache, id } of fileDefs) {
		if (!lightningCache) continue

		const json = JSON5.parse(
			(
				await fs.readFile(join('./data/lightningCache', lightningCache))
			).toString('utf-8'),
			null
		)

		try {
			await fs.rmdir(join('./data/schema', id, 'dynamic'), {
				recursive: true,
			})
		} catch {}
		await fs.mkdir(join('./data/schema', id, 'dynamic/currentContext'), {
			recursive: true,
		})

		for (const cacheDef of json) {
			const key = Object.keys(cacheDef).find(
				(key) => !key.startsWith('@')
			)
			if (!key) continue

			await fs.writeFile(
				join('./data/schema', id, `dynamic/${key}Enum.json`),
				JSON.stringify({
					$schema: 'http://json-schema.org/draft-07/schema',
					type: 'string',
					enum: [],
				})
			)
			await fs.writeFile(
				join('./data/schema', id, `dynamic/${key}Property.json`),
				JSON.stringify({
					$schema: 'http://json-schema.org/draft-07/schema',
					type: 'object',
					properties: {},
				})
			)

			await fs.writeFile(
				join(
					'./data/schema',
					id,
					`dynamic/currentContext/${key}Enum.json`
				),
				JSON.stringify({
					$schema: 'http://json-schema.org/draft-07/schema',
					type: 'string',
					enum: [],
				})
			)
			await fs.writeFile(
				join(
					'./data/schema',
					id,
					`dynamic/currentContext/${key}Property.json`
				),
				JSON.stringify({
					$schema: 'http://json-schema.org/draft-07/schema',
					type: 'object',
					properties: {},
				})
			)
		}
	}
}
