import JSON5 from 'json5'
import { join, basename } from 'path'
import { promises as fs } from 'fs'

export async function buildDynamicSchemas() {
	const fileDefs = JSON5.parse(
		(await fs.readFile('./data/fileDefinitions.json')).toString('utf-8'),
		null
	)

	try {
		await fs.rmdir(join('./data/schema/dynamic/currentContext'), {
			recursive: true,
		})
	} catch {}

	for (const { lightningCache, id } of fileDefs) {
		if (!lightningCache) continue

		const json = JSON5.parse(
			(
				await fs.readFile(join('./data/lightningCache', lightningCache))
			).toString('utf-8'),
			null
		)

		try {
			await Deno.remove(join('./data/schema/dynamic', id), {
				recursive: true,
			})
		} catch {}
		await fs.mkdir(join('./data/schema/dynamic', id, 'currentContext'), {
			recursive: true,
		})

		for (const cacheDef of json) {
			const key = Object.keys(cacheDef).find(key => !key.startsWith('@'))
			if (!key) continue

			await fs.writeFile(
				join('./data/schema/dynamic', id, `${key}Enum.json`),
				JSON.stringify({
					$schema: 'http://json-schema.org/draft-07/schema',
					type: 'string',
					enum: [],
				})
			)
			await fs.writeFile(
				join('./data/schema/dynamic', id, `${key}Property.json`),
				JSON.stringify({
					$schema: 'http://json-schema.org/draft-07/schema',
					type: 'object',
					properties: {},
				})
			)

			await fs.writeFile(
				join(
					'./data/schema/dynamic',
					id,
					`currentContext/${key}Enum.json`
				),
				JSON.stringify({
					$schema: 'http://json-schema.org/draft-07/schema',
					type: 'string',
					enum: [],
				})
			)
			await fs.writeFile(
				join(
					'./data/schema/dynamic',
					id,
					`currentContext/${key}Property.json`
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
