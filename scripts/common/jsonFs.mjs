import { join } from 'path'
import json5 from 'json5'
import { promises as fs } from 'fs'

export function readJson(filePath) {
	return fs
		.readFile(filePath)
		.then((buffer) => json5.parse(buffer.toString('utf-8')))
}

export function writeJson(filePath, fileContent) {
	return fs.writeFile(filePath, JSON.stringify(fileContent))
}
