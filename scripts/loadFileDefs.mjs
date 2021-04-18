import { join } from 'path'
import { promises as fs } from 'fs'
import json5 from 'json5'

export async function loadFileDefs() {
	let fileDefs = []
	const dirents = await fs.readdir('./data/fileDefinition', {
		withFileTypes: true,
	})

	for (const dirent of dirents) {
		if (dirent.isFile())
			fileDefs.push(
				await fs
					.readFile(join('./data/fileDefinition', dirent.name))
					.then(buffer => json5.parse(buffer.toString('utf-8')))
			)
	}

	return fileDefs
}
