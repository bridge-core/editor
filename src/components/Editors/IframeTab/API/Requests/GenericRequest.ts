import { IframeApi } from '../IframeApi'
import { IDisposable } from '/@/types/disposable'

export abstract class GenericRequest<Payload, Response> {
	protected disposables: IDisposable[] = []

	constructor(name: string, protected api: IframeApi) {
		this.api.channelSetup.once(() => {
			this.disposables.push(
				this.api.channel.on<Payload, Response>(name, (data, origin) =>
					this.handle(data, origin)
				)
			)
		})
	}

	abstract handle(data: Payload, origin: string): Promise<Response> | Response

	dispose() {
		this.disposables.forEach((disposable) => disposable.dispose())
		this.disposables = []
	}
}
