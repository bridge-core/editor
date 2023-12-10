import { Dash, initRuntimes } from 'dash-compiler'
import { CompatabilityFileSystem } from '@/libs/fileSystem/CompatabilityFileSystem'
import { WorkerFileSystemEndPoint } from '@/libs/fileSystem/WorkerFileSystem'
import { CompatabilityFileType } from '@/libs/data/compatability/FileType'
import wasmUrl from '@swc/wasm-web/wasm-web_bg.wasm?url'
import { CompatabilityPackType } from '../data/compatability/PackType'
import { v4 as uuid } from 'uuid'

initRuntimes(wasmUrl)

const inputFileSystem = new WorkerFileSystemEndPoint('inputFileSystem')
const compatabilityInputFileSystem = new CompatabilityFileSystem(
	inputFileSystem
)
const outputFileSystem = new WorkerFileSystemEndPoint('outputFileSystem')
const compatabilityOutputFileSystem = new CompatabilityFileSystem(
	outputFileSystem
)

let dash: null | Dash<{ fileTypes: any }> = null

async function getJsonData(path: string): Promise<any> {
	if (path.startsWith('data/')) path = path.slice('path/'.length)

	console.log('Getting json for', path)

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
		}
	)
	await dash.setup({
		fileTypes: await getJsonData(
			'packages/minecraftBedrock/fileDefinitions.json'
		),
	})

	await dash.reload()
	await dash.build()

	console.log('Dash setup complete!')
}

onmessage = (event: any) => {
	if (!event.data) return

	if (event.data.action === 'setup')
		setup(JSON.parse(event.data.config), event.data.configPath)
}
