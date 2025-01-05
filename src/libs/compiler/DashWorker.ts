import { Dash, initRuntimes } from '@bridge-editor/dash-compiler'
import { CompatabilityFileSystem } from '@/libs/fileSystem/CompatabilityFileSystem'
import { WorkerFileSystemEndPoint } from '@/libs/fileSystem/WorkerFileSystem'
import { CompatabilityFileType } from '@/libs/data/compatability/FileType'
import { CompatabilityPackType } from '../data/compatability/PackType'
import { sendAndWait } from '../worker/Communication'
import wasmUrl from '@swc/wasm-web/wasm-web_bg.wasm?url'
import { initRuntimes as initJsRuntimes } from '@bridge-editor/js-runtime'

initJsRuntimes(wasmUrl)
initRuntimes(wasmUrl)

//@ts-ignore make path browserify work in web worker
globalThis.process = {
	cwd: () => '',
	env: {},
	release: {
		name: 'browser',
	},
}

const inputFileSystem = new WorkerFileSystemEndPoint('inputFileSystem')
const compatabilityInputFileSystem = new CompatabilityFileSystem(inputFileSystem)
const outputFileSystem = new WorkerFileSystemEndPoint('outputFileSystem')
const compatabilityOutputFileSystem = new CompatabilityFileSystem(outputFileSystem)

let dash: null | Dash<{ fileTypes: any; packTypes: any }> = null

async function getJsonData(path: string): Promise<any> {
	if (path.startsWith('data/')) path = path.slice('path/'.length)

	return (
		await sendAndWait({
			action: 'getJsonData',
			path,
		})
	).data
}

async function setup(config: any, mode: 'development' | 'production', configPath: string, compilerConfigPath: string | undefined, actionId: string) {
	const packType = new CompatabilityPackType(config)
	const fileType = new CompatabilityFileType(config, () => false)

	dash = new Dash<{ fileTypes: any; packTypes: any }>(compatabilityInputFileSystem, compatabilityOutputFileSystem, <any>{
		config: configPath,
		compilerConfig: compilerConfigPath,
		packType,
		fileType,
		requestJsonData: <any>getJsonData,
		console: {
			log(...args: any[]) {
				postMessage({
					action: 'log',
					message: args.join(' '),
				})

				console.log(...args)
			},
			error(...args: any[]) {
				postMessage({
					action: 'log',
					message: args.join(' '),
				})

				console.error(...args)
			},
			time: console.time,
			timeEnd: console.timeEnd,
		},
		mode,
	})

	dash.progress.onChange((progress: { percentage: number }) => {
		postMessage({
			action: 'progress',
			progress: progress.percentage,
		})
	})

	await dash.setup({
		fileTypes: await getJsonData('packages/minecraftBedrock/fileDefinitions.json'),
		packTypes: await getJsonData('packages/minecraftBedrock/packDefinitions.json'),
	})

	postMessage({
		action: 'setupComplete',
		id: actionId,
	})
}

async function build(actionId: string) {
	if (!dash) {
		console.warn('Tried building but Dash is not setup yet!')

		return
	}

	await dash.build()

	postMessage({
		action: 'buildComplete',
		id: actionId,
	})
}

async function compileFile(actionId: string, filePath: string, fileData: Uint8Array) {
	if (!dash) {
		console.warn('Tried compiling file but Dash is not setup yet!')

		return
	}

	postMessage({
		action: 'compileFileComplete',
		id: actionId,
		result: await dash.compileFile(filePath, fileData),
	})
}

onmessage = (event: any) => {
	if (!event.data) return

	if (event.data.action === 'setup') setup(event.data.config, event.data.mode, event.data.configPath, event.data.compilerConfigPath, event.data.id)

	if (event.data.action === 'build') build(event.data.id)

	if (event.data.action === 'compileFile') compileFile(event.data.id, event.data.filePath, event.data.FileData)
}
