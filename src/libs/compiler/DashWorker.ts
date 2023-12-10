import { Dash } from 'dash-compiler'
import { CompatabilityFileSystem } from '@/libs/fileSystem/CompatabilityFileSystem'
import { WorkerFileSystemEndPoint } from '@/libs/fileSystem/WorkerFileSystem'

const inputFileSystem = new WorkerFileSystemEndPoint('inputFileSystem')
const compatabilityInputFileSystem = new CompatabilityFileSystem(
	inputFileSystem
)
const outputFileSystem = new WorkerFileSystemEndPoint('outputFileSystem')
const compatabilityOutputFileSystem = new CompatabilityFileSystem(
	outputFileSystem
)

let dash: null | Dash = null

async function setup(config: string) {
	console.log('Setting up Dash...', config)

	dash = new Dash(
		compatabilityInputFileSystem,
		compatabilityOutputFileSystem,
		{
			config: config,
			packType: <any>undefined,
			fileType: <any>undefined,
			requestJsonData: <any>undefined,
		}
	)

	await dash.setup(undefined)

	console.log(dash.isCompilerActivated)

	// await dash.reload()
	// await dash.build()

	console.log('Dash setup complete!')
}

onmessage = (event: any) => {
	if (!event.data) return

	if (event.data.action === 'setup') setup(event.data.config)
}
