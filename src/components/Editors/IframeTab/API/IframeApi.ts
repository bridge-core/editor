import { Channel } from 'bridge-iframe-api'
import { App } from '/@/App'
import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'
import { Signal } from '/@/components/Common/Event/Signal'
import { IDisposable } from '/@/types/disposable'
import { isNightly as isNightlyBuild } from '/@/utils/app/isNightly'
import { version as appVersion } from '/@/utils/app/version'

export class IframeApi {
	didSetup = false
	loaded = new Signal<void>()
	protected disposables: IDisposable[] = []
	protected _channel?: Channel
	readyToExtend = new EventDispatcher<void>()

	constructor(protected iframe: HTMLIFrameElement) {
		this.iframe.addEventListener('load', async () => {
			if (!iframe.src && !iframe.srcdoc) return

			this._channel = new Channel(this.iframe.contentWindow)

			await this.channel.open()

			this.onLoad()
			this.loaded.dispatch()

			this.setup()
		})
	}

	get channel() {
		if (!this._channel)
			throw new Error(
				'Channel is not initialized yet. Make sure to await iframeApi.loaded.fired'
			)
		return this._channel
	}

	async on<T = any>(
		event: string,
		callback: (data: T, origin: string) => void
	) {
		await this.loaded.fired

		const disposable = this.channel.on(event, callback)

		this.disposables.push(disposable)
	}
	async trigger<T = any>(event: string, data: T) {
		await this.loaded.fired
		return this.channel.simpleTrigger<T>(event, data)
	}

	protected onLoad() {
		this.disposables.forEach((disposable) => disposable.dispose())
		this.disposables = []

		this.trigger('bridgeReady', {
			appVersion,
			isNightlyBuild,
		})
		this.readyToExtend.dispatch()
	}

	setup() {
		if (this.didSetup) return

		this.on('readFile', async (data, origin) => {
			const app = await App.getApp()
			return await app.fileSystem.readFile(data.path)
		})

		this.didSetup = true
	}
}
