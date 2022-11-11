import { IframeApi } from '../../IframeApi'
import { GenericRequest } from '../GenericRequest'
import { resolveFileReference } from './ResolveFileReference'

export class ReadTextFileRequest extends GenericRequest<string, string> {
	constructor(api: IframeApi) {
		super('fs.readTextFile', api)
	}

	async handle(filePath: string, origin: string): Promise<string> {
		const fileHandle = await resolveFileReference(filePath, this.api)
		const file = await fileHandle.getFile()

		return await file.text()
	}
}
