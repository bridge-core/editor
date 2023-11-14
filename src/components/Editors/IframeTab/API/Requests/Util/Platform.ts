import { IframeApi } from '../../IframeApi'
import { GenericRequest } from '../GenericRequest'
import { platform } from '/@/libs/os'

export class PlatformRequest extends GenericRequest<undefined, string> {
	constructor(api: IframeApi) {
		super('util.platform', api)
	}

	async handle(_: undefined, origin: string) {
		return platform()
	}
}
