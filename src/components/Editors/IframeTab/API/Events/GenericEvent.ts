import { IframeApi } from '../IframeApi'
import { IDisposable } from '/@/types/disposable'

export abstract class GenericEvent {
	protected disposables: IDisposable[] = []
	constructor(protected api: IframeApi) {
		this.disposables.push(
			this.api.loaded.on(() => this.onApiLoaded(), true),
			this.api.loaded.once(() => this.setup(), true)!
		)
	}

	onApiLoaded() {}

	abstract setup(): Promise<void> | void

	dispose() {
		this.disposables.forEach((disposable) => disposable.dispose())
		this.disposables = []
	}
}
