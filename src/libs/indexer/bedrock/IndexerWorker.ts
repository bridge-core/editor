import { WorkerFileSystemEndPoint } from '@/libs/fileSystem/WorkerFileSystem'
import { join } from '@/libs/path'
import { Runtime } from '@/libs/runtime/Runtime'
import { sendAndWait } from '@/libs/worker/Communication'
import { walkObject } from 'bridge-common-utils'
import { IConfigJson } from 'mc-project-core'

interface IndexInstruction {
	cacheKey: string
	path: string
	pathScript?: string
	script?: string
	filter?: string[]
}

const fileSystem = new WorkerFileSystemEndPoint()

const runtime = new Runtime(fileSystem)

let instructions: { [key: string]: IndexInstruction[] | string } = {}

let config: IConfigJson | undefined = undefined
let projectPath: string = '/'

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

async function runLightningCacheScript(
	script: string,
	path: string,
	value: string
): Promise<any> {
	const scriptResult = await runtime.run(
		path,
		{
			Bridge: {
				value,
				async withExtension(basePath: string, extensions: string[]) {
					for (const extension of extensions) {
						const possiblePath = basePath + extension

						if (await fileSystem.exists(possiblePath))
							return possiblePath
					}
				},
				resolvePackPath(packId: string, path: string) {
					if (!config) return ''
					if (config.packs) return ''

					if (path === undefined) {
						return join(
							projectPath ?? '',
							(<any>config.packs)[packId]
						)
					}

					return join(
						projectPath ?? '',
						(<any>config.packs)[packId],
						path
					)
				},
			},
		},
		`
		___module.execute = async function(){
			${script}
		}
		`
	)

	return await scriptResult.execute()
}

async function indexFile(path: string) {
	let fileType = await getFileType(path)

	let fileInstructions: IndexInstruction[] | string | undefined = undefined

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
				const { cacheKey, path, filter, script, pathScript } =
					instruction

				let paths: string[] = []

				if (typeof path === 'string') {
					paths = [path]
				} else {
					paths = path
				}

				if (pathScript !== undefined) {
					paths = (
						await runtime.run(
							path,
							{
								Bridge: { paths },
							},
							`
						___module.execute = async function(){
							${pathScript}
						}
						`
						)
					).execute()
				}

				if (!Array.isArray(paths) || paths.length === 0) continue

				let foundData: string[] = []

				for (const jsonPath of paths) {
					walkObject(jsonPath, json, async (data) => {
						if (filter !== undefined)
							data = data.filter(
								(value: string) => !filter.includes(value)
							)

						if (script !== undefined) {
							data = (
								await Promise.all(
									data.map(async (value: string) => {
										return await runLightningCacheScript(
											script,
											path,
											value
										)
									})
								)
							).filter((value: unknown) => value !== undefined)
						}

						if (Array.isArray(data)) {
							foundData = foundData.concat(data)
						} else if (typeof data === 'object') {
							foundData = foundData.concat(Object.keys(data))
						} else {
							foundData.push(data)
						}
					})
				}

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
	newConfig: IConfigJson,
	newInstructions: { [key: string]: any },
	actionId: string,
	path: string
) {
	index = {}

	config = newConfig

	instructions = newInstructions

	projectPath = path

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
			event.data.config,
			event.data.instructions,
			event.data.id,
			event.data.path
		)
}
