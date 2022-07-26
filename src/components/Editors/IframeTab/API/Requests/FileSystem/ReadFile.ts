import { IframeApi } from '../../IframeApi'
import { GenericRequest } from '../GenericRequest'
import { App } from '/@/App'

export class ReadFileRequest extends GenericRequest<string, Uint8Array> {
	constructor(api: IframeApi) {
		super('fs.readFile', api)
	}

	async handle(filePath: string, origin: string): Promise<Uint8Array> {
		const app = await App.getApp()
		const file = await app.fileSystem.readFile(filePath)

		return new Uint8Array(await file.arrayBuffer())
	}
}
