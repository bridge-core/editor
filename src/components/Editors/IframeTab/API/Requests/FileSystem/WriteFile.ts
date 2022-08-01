import { IframeApi } from '../../IframeApi'
import { GenericRequest } from '../GenericRequest'
import { App } from '/@/App'

export interface IWriteFilePayload {
	filePath: string
	data: Uint8Array | string
}

export class WriteFileRequest extends GenericRequest<IWriteFilePayload, void> {
	constructor(api: IframeApi) {
		super('fs.writeFile', api)
	}

	async handle(
		{ filePath, data }: IWriteFilePayload,
		origin: string
	): Promise<void> {
		const app = await App.getApp()

		await app.fileSystem.writeFile(filePath, data)
	}
}
