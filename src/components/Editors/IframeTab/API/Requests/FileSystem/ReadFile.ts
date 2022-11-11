import { IframeApi } from '../../IframeApi'
import { GenericRequest } from '../GenericRequest'
import { resolveFileReference } from './ResolveFileReference'

export class ReadFileRequest extends GenericRequest<string, Uint8Array> {
	constructor(api: IframeApi) {
		super('fs.readFile', api)
	}

	async handle(filePath: string, origin: string): Promise<Uint8Array> {
		const fileHandle = await resolveFileReference(filePath, this.api)
		const file = await fileHandle.getFile()

		return new Uint8Array(await file.arrayBuffer())
	}
}
