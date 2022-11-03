import { Channel } from 'bridge-iframe-api'
import { GenericEvent } from './Events/GenericEvent'
import { ThemeChangeEvent } from './Events/ThemeChange'
import { GenericRequest } from './Requests/GenericRequest'
import { ReadFileRequest } from './Requests/FileSystem/ReadFile'
import { Signal } from '/@/components/Common/Event/Signal'
import { IDisposable } from '/@/types/disposable'
import { isNightly as isNightlyBuild } from '/@/utils/app/isNightly'
import { version as appVersion } from '/@/utils/app/version'
import { WriteFileRequest } from './Requests/FileSystem/WriteFile'
import { ReadTextFileRequest } from './Requests/FileSystem/ReadTextFile'
import { IframeTab } from '../IframeTab'
import { OpenFileEvent } from './Events/Tab/OpenFile'
import { openedFileReferenceName } from './Requests/FileSystem/ResolveFileReference'
import { GetItemPreviewRequest } from './Requests/Project/GetItemPreview'
import { ReadAsDataUrlRequest } from './Requests/FileSystem/ReadAsDataUrl'
import { FindRequest } from './Requests/PackIndexer/Find'
import { GetFileRequest } from './Requests/PackIndexer/GetFile'
import { wait } from '/@/utils/wait'

export class IframeApi {
	didSetup = false
	loaded = new Signal<void>()
	channelSetup = new Signal<void>()
	protected disposables: IDisposable[] = []
	protected _channel?: Channel
	protected events: GenericEvent[] = [
		new ThemeChangeEvent(this),
		new OpenFileEvent(this),
	]
	protected requests: GenericRequest<unknown, unknown>[] = [
		// FileSystem
		new ReadFileRequest(this),
		new ReadTextFileRequest(this),
		new ReadAsDataUrlRequest(this),
		new WriteFileRequest(this),

		// Project
		new GetItemPreviewRequest(this),

		// PackIndexer,
		new FindRequest(this),
		new GetFileRequest(this),
	]

	constructor(protected tab: IframeTab, protected iframe: HTMLIFrameElement) {
		this.iframe.addEventListener('load', async () => {
			if (!iframe.src && !iframe.srcdoc) return

			this._channel = new Channel(this.iframe.contentWindow)
			this.channelSetup.dispatch()

			await wait(20)
			await this.channel.open()

			this.loaded.dispatch()
			this.onLoad()
		})
	}

	get app() {
		return this.tab.project.app
	}

	get openWithPayload() {
		const payload = this.tab.getOptions().openWithPayload ?? {}

		return {
			filePath: payload.filePath,
			fileReference: openedFileReferenceName,
			isReadOnly: payload.isReadOnly ?? false,
		}
	}
	get openedFileHandle() {
		return this.tab.getOptions().openWithPayload?.fileHandle ?? null
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
