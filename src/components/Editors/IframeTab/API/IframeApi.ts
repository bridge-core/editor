import { Channel } from 'bridge-iframe-api'
import { GenericEvent } from './Events/GenericEvent'
import { ThemeChangeEvent } from './Events/ThemeChange'
import { GenericRequest } from './Requests/GenericRequest'
import { ReadFileRequest } from './Requests/FileSystem/ReadFile'
import { App } from '/@/App'
import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'
import { Signal } from '/@/components/Common/Event/Signal'
import { IDisposable } from '/@/types/disposable'
import { isNightly as isNightlyBuild } from '/@/utils/app/isNightly'
import { version as appVersion } from '/@/utils/app/version'
import { WriteFileRequest } from './Requests/FileSystem/WriteFile'

export class IframeApi {
	didSetup = false
	loaded = new Signal<void>()
	protected disposables: IDisposable[] = []
	protected _channel?: Channel
	protected events: GenericEvent[] = [new ThemeChangeEvent(this)]
	protected requests: GenericRequest<unknown, unknown>[] = [
		new ReadFileRequest(this),
		new WriteFileRequest(this),
	]

	constructor(protected iframe: HTMLIFrameElement) {
		this.iframe.addEventListener('load', async () => {
			if (!iframe.src && !iframe.srcdoc) return

			this._channel = new Channel(this.iframe.contentWindow)

			await this.channel.open()

			this.onLoad()
			this.loaded.dispatch()
		})
	}

	get channel() {
		if (!this._channel)
			throw new Error(
				'Channel is not initialized yet. Make sure to await iframeApi.loaded.fired'
			)
		return this._channel
	}

	on<T = any>(event: string, callback: (data: T, origin: string) => void) {
		return this.channel.on(event, callback)
	}
	trigger<T = any>(event: string, data: T) {
		return this.channel.simpleTrigger<T>(event, data)
	}

	protected onLoad() {
		this.disposables.forEach((disposable) => disposable.dispose())
		this.disposables = []

		this.trigger('app.buildInfo', {
			appVersion,
			isNightlyBuild,
		})
	}

	dispose() {
		this.events.forEach((event) => event.dispose())
		this.events = []
		this.requests.forEach((request) => request.dispose())
		this.requests = []
	}
}
