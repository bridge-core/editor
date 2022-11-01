import { IframeApi } from '../../IframeApi'
import { GenericRequest } from '../GenericRequest'

export class SetIsUnsavedRequest extends GenericRequest<boolean, void> {
	constructor(api: IframeApi) {
		super('tab.setIsUnsaved', api)
	}

	async handle(isUnsaved: boolean, origin: string) {
		this.api.tab.setIsUnsaved(isUnsaved)
	}
}
