import { buildDynamicSchemas } from './buildDynamicSchemas.mjs'
import fs from 'fs'
import archiver from 'archiver'
import { runSchemaScripts } from './buildSchemaScripts.mjs'

/**
 * Taken from https://stackoverflow.com/a/51518100
 */
function zipDirectory(source, out) {
	const archive = archiver('zip', { zlib: { level: 9 } })
	const stream = fs.createWriteStream(out)

	return new Promise((resolve, reject) => {
		archive
			.directory(source, false)
			.on('error', err => reject(err))
			.pipe(stream)

		stream.on('close', () => resolve())
		archive.finalize()
	})
}

;(async () => {
	await buildDynamicSchemas()
	await runSchemaScripts()
	await zipDirectory('./data', './public/data/package.zip')
	await fs.promises.copyFile(
		'./data/version.txt',
		'./public/data/version.txt'
	)
})()
