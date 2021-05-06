import { join } from 'path'
import { promises as fs } from 'fs'
import { loadFileDefs } from './loadFileDefs.mjs'
import { readJson, writeJson } from '../common/jsonFs.mjs'

export async function buildDynamicSchemas(packageName) {
	const fileDefs = await loadFileDefs(packageName)

	for (const { lightningCache, id } of fileDefs) {
		if (!lightningCache || !lightningCache.endsWith('.json')) continue

		let json
		try {
			json = await readJson(
				join(
					`./data/packages/${packageName}/lightningCache`,
					lightningCache
				)
			)
		} catch {
			throw new Error(
				`Failed to load lightning cache file "${lightningCache}"`
			)
		}

		try {
			await fs.rmdir(
				join(`./data/packages/${packageName}/schema`, id, 'dynamic'),
				{
					recursive: true,
				}
			)
		} catch {}
		await fs.mkdir(
			join(
				`./data/packages/${packageName}/schema`,
				id,
				'dynamic/currentContext'
			),
			{
				recursive: true,
			}
		)

		for (const cacheDef of json) {
			const key = cacheDef.cacheKey
			if (!key) continue

			await writeJson(
				join(
					`./data/packages/${packageName}/schema`,
					id,
					`dynamic/${key}Enum.json`
				),
				{
					$schema: 'http://json-schema.org/draft-07/schema',
					type: 'string',
					enum: [],
				}
			)
			await writeJson(
				join(
					`./data/packages/${packageName}/schema`,
					id,
					`dynamic/${key}Property.json`
				),
				{
					$schema: 'http://json-schema.org/draft-07/schema',
					type: 'object',
					properties: {},
				}
			)

			await writeJson(
				join(
					`./data/packages/${packageName}/schema`,
					id,
					`dynamic/currentContext/${key}Enum.json`
				),
				{
					$schema: 'http://json-schema.org/draft-07/schema',
					type: 'string',
					enum: [],
				}
			)
			await writeJson(
				join(
					`./data/packages/${packageName}/schema`,
					id,
					`dynamic/currentContext/${key}Property.json`
				),
				{
					$schema: 'http://json-schema.org/draft-07/schema',
					type: 'object',
					properties: {},
				}
			)
		}
	}
}
