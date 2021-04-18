import { join } from 'path'
import { promises as fs } from 'fs'
import { readJson } from '../common/jsonFs.mjs'

export async function loadFileDefs(packageName) {
	let fileDefs = []
	const dirents = await fs
		.readdir(`./data/packages/${packageName}/fileDefinition`, {
			withFileTypes: true,
		})
		.catch(() => [])

	for (const dirent of dirents) {
		if (dirent.isFile())
			fileDefs.push(
				await readJson(
					join(
						`./data/packages/${packageName}/fileDefinition`,
						dirent.name
					)
				)
			)
	}

	return fileDefs
}
