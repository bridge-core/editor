import { IframeApi } from '../../IframeApi'
import { GenericRequest } from '../GenericRequest'
import { resolveFileReference } from './ResolveFileReference'
import { loadHandleAsDataURL } from '/@/utils/loadAsDataUrl'

export class ReadAsDataUrlRequest extends GenericRequest<string, string> {
	constructor(api: IframeApi) {
		super('fs.readAsDataUrl', api)
	}

	async handle(filePath: string, origin: string): Promise<string> {
		const fileHandle = await resolveFileReference(filePath, this.api)

		return await loadHandleAsDataURL(fileHandle)
	}
}
