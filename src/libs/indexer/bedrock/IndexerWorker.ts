import { WorkerFileSystemEndPoint } from '@/libs/fileSystem/WorkerFileSystem'
import { sep } from '@/libs/path'
import { sendAndWait } from '@/libs/worker/Communication'

const fileSystem = new WorkerFileSystemEndPoint()

let instructions: { [key: string]: any } = {}

const textDecoder = new TextDecoder()

async function getFileType(path: string): Promise<any> {
	return (
		await sendAndWait({
			action: 'getFileType',
			path,
		})
	).fileType
}

let index: { [key: string]: { fileType: string; data?: any } } = {}

function walkObject(path: string, object: any): string[] {
	const keys = path.split(sep)

	while (keys.length > 0) {
		const currentKey = keys.shift()!

		if (object[currentKey] === undefined) return []

		object = object[currentKey]
	}

	if (Array.isArray(object)) return object
	if (typeof object === 'object') return Object.keys(object)

	return [object]
}

async function indexFile(path: string) {
	let fileType = await getFileType(path)

	let fileInstructions = undefined

	if (fileType && fileType.lightningCache)
		fileInstructions =
			instructions[
				'file:///data/packages/minecraftBedrock/lightningCache/' +
					fileType.lightningCache
			]

	let data: { [key: string]: any } = {}

	if (fileInstructions !== undefined) {
		let text = undefined
		let json = undefined

		try {
			const content = await fileSystem.readFile(path)

			text = textDecoder.decode(new Uint8Array(content))
			json = JSON.parse(text)
		} catch {}

		if (typeof fileInstructions === 'string') {
		} else {
			for (const instruction of fileInstructions) {
				console.log(instruction)

				const { cacheKey, path, pathScript } = instruction

				let paths: string[] = []

				if (typeof path === 'string') {
					paths = [path]
				} else {
					paths = path
				}

				let foundData: string[] = []

				for (const path of paths) {
					foundData = foundData.concat(walkObject(path, json))
				}

				console.log('Setting cache data', cacheKey, foundData, json)

				data[cacheKey] = foundData
			}
		}
	}

	index[path] = {
		fileType: fileType ? fileType.id : 'unkown',
		data,
	}
}

async function indexDirectory(path: string) {
	for (const entry of await fileSystem.readDirectoryEntries(path)) {
		if (entry.type == 'directory') {
			await indexDirectory(entry.path)
		} else {
			await indexFile(entry.path)
		}
	}
}

async function setup(
	fileTypes: any[],
	newInstructions: { [key: string]: any },
	actionId: string,
	path: string
) {
	index = {}

	instructions = newInstructions

	await indexDirectory(path)

	postMessage({
		action: 'setupComplete',
		index,
		id: actionId,
	})
}

onmessage = (event: any) => {
	if (!event.data) return

	if (event.data.action === 'setup')
		setup(
			event.data.fileTypes,
			event.data.instructions,
			event.data.id,
			event.data.path
		)
}
