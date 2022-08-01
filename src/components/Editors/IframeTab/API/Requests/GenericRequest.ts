import { IframeApi } from '../IframeApi'
import { IDisposable } from '/@/types/disposable'

export abstract class GenericRequest<Payload, Response> {
	protected disposables: IDisposable[] = []

	constructor(name: string, protected api: IframeApi) {
		this.api.loaded.once(() => {
			this.api.channel.on<Payload, Response>(name, (data, origin) =>
				this.handle(data, origin)
			)
		})
		this.disposables.push()
	}

	abstract handle(data: Payload, origin: string): Promise<Response> | Response

	dispose() {
		this.disposables.forEach((disposable) => disposable.dispose())
		this.disposables = []
	}
}
