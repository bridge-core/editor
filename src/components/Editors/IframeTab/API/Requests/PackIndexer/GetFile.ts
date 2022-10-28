import { IframeApi } from '../../IframeApi'
import { GenericRequest } from '../GenericRequest'
import { App } from '/@/App'

export class GetFileRequest extends GenericRequest<
	string,
	Record<string, unknown>
> {
	constructor(api: IframeApi) {
		super('packIndexer.getFile', api)
	}

	async handle(filePath: string, origin: string) {
		const packIndexer = this.api.app.project.packIndexer
		await packIndexer.fired

		const fileType = App.fileType.getId(filePath)

		return await packIndexer.service.getCacheDataFor(fileType, filePath)
	}
}
