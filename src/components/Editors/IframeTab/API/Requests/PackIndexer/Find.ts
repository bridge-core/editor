import { IframeApi } from '../../IframeApi'
import { GenericRequest } from '../GenericRequest'

interface IRequestData {
	findFileType: string
	whereCacheKey: string
	matchesOneOf: string[]
	fetchAll?: boolean
}

export class FindRequest extends GenericRequest<IRequestData, string[]> {
	constructor(api: IframeApi) {
		super('packIndexer.find', api)
	}

	async handle(
		{ findFileType, whereCacheKey, matchesOneOf, fetchAll }: IRequestData,
		origin: string
	) {
		const packIndexer = this.api.app.project.packIndexer
		await packIndexer.fired

		return await packIndexer.service.find(
			findFileType,
			whereCacheKey,
			matchesOneOf,
			fetchAll
		)
	}
}
