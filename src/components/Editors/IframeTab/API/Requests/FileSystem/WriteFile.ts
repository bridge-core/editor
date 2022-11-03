import { IframeApi } from '../../IframeApi'
import { GenericRequest } from '../GenericRequest'
import { resolveFileReference } from './ResolveFileReference'
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

		const fileHandle = await resolveFileReference(filePath, this.api, true)

		await app.fileSystem.write(fileHandle, data)
	}
}
