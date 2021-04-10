import { EventSystem } from '/@/components/Common/Event/EventSystem'

export class FileChangeRegistry extends EventSystem<File> {
	constructor() {
		super([], true)
	}
	dispatch(name: string, fileContent: File) {
		if (!this.hasEvent(name)) return

		super.dispatch(name, fileContent)
	}
	on(name: string, listener: (data: File) => void) {
		if (!this.hasEvent(name)) this.create(name)

		return super.on(name, listener)
	}
}
