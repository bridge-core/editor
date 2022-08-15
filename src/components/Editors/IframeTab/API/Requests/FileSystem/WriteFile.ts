import { IframeApi } from '../../IframeApi'
import { GenericRequest } from '../GenericRequest'
import { App } from '/@/App'

export interface IWriteFilePayload {
	filePath: string
	data: Uint8Array | string
}

export const openedFileReferenceName = '~bridge://OPENED-FILE'

export class WriteFileRequest extends GenericRequest<IWriteFilePayload, void> {
	constructor(api: IframeApi) {
		super('fs.writeFile', api)
	}

	async handle(
		{ filePath, data }: IWriteFilePayload,
		origin: string
	): Promise<void> {
		const app = await App.getApp()

		if (filePath === openedFileReferenceName) {
			const fileHandle = this.api.openedFileHandle

			if (!fileHandle) throw new Error(`No opened file to write to!`)
			await app.fileSystem.write(fileHandle, data)

			return
		}

		await app.fileSystem.writeFile(filePath, data)
	}
}
