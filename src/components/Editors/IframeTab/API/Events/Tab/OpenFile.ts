import { GenericEvent } from '../GenericEvent'

export class OpenFileEvent extends GenericEvent {
	setup() {
		this.api.trigger('tab.openFile', this.api.openWithPayload)
	}
}
