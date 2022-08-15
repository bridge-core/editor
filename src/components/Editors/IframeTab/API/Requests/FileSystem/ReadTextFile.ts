import { IframeApi } from '../../IframeApi'
import { GenericRequest } from '../GenericRequest'
import { App } from '/@/App'

export class ReadTextFileRequest extends GenericRequest<string, string> {
	constructor(api: IframeApi) {
		super('fs.readTextFile', api)
	}

	async handle(filePath: string, origin: string): Promise<string> {
		const app = await App.getApp()
		const file = await app.fileSystem.readFile(filePath)

		return await file.text()
	}
}
