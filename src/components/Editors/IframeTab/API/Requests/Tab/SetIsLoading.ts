import { IframeApi } from '../../IframeApi'
import { GenericRequest } from '../GenericRequest'

export class SetIsLoadingRequest extends GenericRequest<boolean, void> {
	constructor(api: IframeApi) {
		super('tab.setIsLoading', api)
	}

	async handle(isLoading: boolean, origin: string) {
		this.api.tab.setIsLoading(isLoading)
	}
}
