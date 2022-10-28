import { IframeApi } from '../../IframeApi'
import { GenericRequest } from '../GenericRequest'
import { resolveFileReference } from './ResolveFileReference'
import { loadHandleAsDataURL } from '/@/utils/loadAsDataUrl'

export class ReadAsDataUrlRequest extends GenericRequest<string, string> {
	constructor(api: IframeApi) {
		super('fs.readAsDataUrl', api)
	}

	async handle(filePath: string, origin: string): Promise<string> {
		console.log('READ AS DATA URL')
		const fileHandle = await resolveFileReference(filePath, this.api)
		console.log(fileHandle)

		return await loadHandleAsDataURL(fileHandle)
	}
}
