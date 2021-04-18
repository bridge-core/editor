import { join } from 'path'
import { promises as fs } from 'fs'
import { readJson } from '../common/jsonFs.mjs'

export async function loadFileDefs() {
	let fileDefs = []
	const dirents = await fs.readdir('./data/fileDefinition', {
		withFileTypes: true,
	})

	for (const dirent of dirents) {
		if (dirent.isFile())
			fileDefs.push(
				await readJson(join('./data/fileDefinition', dirent.name))
			)
	}

	return fileDefs
}
