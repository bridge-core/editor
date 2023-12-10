import { Dash } from 'dash-compiler'
import { CompatabilityFileSystem } from '@/libs/fileSystem/CompatabilityFileSystem'
import { WorkerFileSystemEndPoint } from '@/libs/fileSystem/WorkerFileSystem'
import { CompatabilityFileType } from '@/libs/data/compatability/FileType'
import { CompatabilityPackType } from '../data/compatability/PackType'
import { v4 as uuid } from 'uuid'

//@ts-ignore make path browserify work in web worker
globalThis.process = {
	cwd: () => '',
	env: {},
	release: {
		name: 'browser',
	},
}

const inputFileSystem = new WorkerFileSystemEndPoint('inputFileSystem')
const compatabilityInputFileSystem = new CompatabilityFileSystem(
	inputFileSystem
)
const outputFileSystem = new WorkerFileSystemEndPoint('outputFileSystem')
const compatabilityOutputFileSystem = new CompatabilityFileSystem(
	outputFileSystem
)

let dash: null | Dash<{ fileTypes: any; packTypes: any }> = null

async function getJsonData(path: string): Promise<any> {
	if (path.startsWith('data/')) path = path.slice('path/'.length)

	let functionToUnbind: EventListener | null = null

	const data = await new Promise<void>((resolve, reject) => {
		let messageId = uuid()

		function recieveMessage(event: MessageEvent) {
			if (!event.data) return
			if (event.data.id !== messageId) return

			resolve(JSON.parse(event.data.data))
		}

		let functionToUnbind = recieveMessage

		addEventListener('message', functionToUnbind)

		postMessage({
			action: 'getJsonData',
			path,
			id: messageId,
		})
	})

	removeEventListener('message', functionToUnbind!)

	return data
}

async function setup(config: any, configPath: string) {
	console.log('Setting up Dash...')

	const packType = new CompatabilityPackType(config)
	const fileType = new CompatabilityFileType(config, () => false)

	dash = new Dash<{ fileTypes: any }>(
		compatabilityInputFileSystem,
		compatabilityOutputFileSystem,
		{
			config: configPath,
			packType,
			fileType,
			requestJsonData: <any>getJsonData,
			console: <any>console,
		}
	)
	await dash.setup({
		fileTypes: await getJsonData(
			'packages/minecraftBedrock/fileDefinitions.json'
		),
		packTypes: await getJsonData(
			'packages/minecraftBedrock/packDefinitions.json'
		),
	})

	await dash.build()

	console.log('Dash setup complete!')
}

onmessage = (event: any) => {
	if (!event.data) return

	if (event.data.action === 'setup')
		setup(JSON.parse(event.data.config), event.data.configPath)
}
