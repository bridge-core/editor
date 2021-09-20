import { EventSystem } from '/@/components/Common/Event/EventSystem'

export class FileChangeRegistry extends EventSystem<File> {
	constructor() {
		super([], true)
	}
	dispatch(name: string, fileContent: File) {
		if (!this.hasEvent(name)) {
			// We always want to dispatch the event for "any" file changed
			this.any.dispatch([name, fileContent])
			return
		}

		// Specific events only get triggered when a listener is registered already
		super.dispatch(name, fileContent)
	}
	on(name: string, listener: (data: File) => void) {
		if (!this.hasEvent(name)) this.create(name)

		return super.on(name, listener)
	}
}
