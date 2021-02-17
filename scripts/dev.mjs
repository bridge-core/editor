import { promises as fs } from 'fs'
import chokidar from 'chokidar'
import dotenv from 'dotenv'
import { dirname, join } from 'path'
dotenv.config()

const targetPath = join(process.env.USER_PATH, 'data/packages')
console.log(targetPath)

function getPath(path) {
	return join(targetPath, path.replace('data\\', ''))
}
async function copyFile(path) {
	console.log(`Updating file ${getPath(path)}`)

	try {
		await fs.mkdir(dirname(getPath(path)))
	} catch {}

	await fs.copyFile(path, getPath(path))
}

chokidar
	.watch('./data', { awaitWriteFinish: true })
	.on('add', copyFile)
	.on('change', copyFile)
	.on('unlink', async path => {
		console.log(`File ${path} has been removed`)
		await fs.unlink(getPath(path))
	})
	.on('unlinkDir', async path => {
		console.log(`Directory ${path} has been removed`)
		await fs.rmdir(getPath(path), { recursive: true })
	})
