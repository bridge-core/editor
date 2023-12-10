import { Dash, initRuntimes } from 'dash-compiler'
import { CompatabilityFileSystem } from '@/libs/fileSystem/CompatabilityFileSystem'
import { WorkerFileSystemEndPoint } from '@/libs/fileSystem/WorkerFileSystem'
import { CompatabilityFileType } from '@/libs/data/compatability/FileType'
import wasmUrl from '@swc/wasm-web/wasm-web_bg.wasm?url'

initRuntimes(wasmUrl)

const inputFileSystem = new WorkerFileSystemEndPoint('inputFileSystem')
const compatabilityInputFileSystem = new CompatabilityFileSystem(
	inputFileSystem
)
const outputFileSystem = new WorkerFileSystemEndPoint('outputFileSystem')
const compatabilityOutputFileSystem = new CompatabilityFileSystem(
	outputFileSystem
)

let dash: null | Dash = null

async function getJson(path: string) {
	console.log('Getting json for', path)

	return {}
}

async function setup(config: any, configPath: string) {
	console.log('Setting up Dash...')
	const fileType = new CompatabilityFileType(config, () => false)

	dash = new Dash(
		compatabilityInputFileSystem,
		compatabilityOutputFileSystem,
		{
			config: configPath,
			packType: <any>undefined,
			fileType,
			requestJsonData: <any>getJson,
		}
	)
	await dash.setup(undefined)

	await dash.reload()
	await dash.build()

	console.log('Dash setup complete!')
}

onmessage = (event: any) => {
	if (!event.data) return

	if (event.data.action === 'setup')
		setup(JSON.parse(event.data.config), event.data.configPath)
}
