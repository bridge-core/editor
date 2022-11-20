import { TabSystem } from '../../TabSystem/TabSystem'
import IframeTabComponent from './IframeTab.vue'
import { Tab } from '../../TabSystem/CommonTab'
import { IframeApi } from './API/IframeApi'
import { markRaw } from 'vue'
import { AnyFileHandle } from '../../FileSystem/Types'
import { getFullScreenElement } from '../../TabSystem/TabContextMenu/Fullscreen'

interface IIframeTabOptions {
	icon?: string
	name?: string
	url?: string
	html?: string
	iconColor?: string
	openWithPayload?: IOpenWithPayload
}

export interface IOpenWithPayload {
	filePath?: string
	fileHandle?: AnyFileHandle
	isReadOnly?: boolean
}

export class IframeTab extends Tab {
	component = IframeTabComponent

	private iframe = document.createElement('iframe')
	protected loaded: Promise<void>
	protected api = markRaw(new IframeApi(this, this.iframe))

	constructor(parent: TabSystem, protected options: IIframeTabOptions = {}) {
		super(parent)

		this.isTemporary = false
		this.iframe.setAttribute(
			'sandbox',
			'allow-scripts allow-same-origin allow-modals allow-popups allow-forms allow-downloads'
		)
		this.loaded = new Promise<void>((resolve) =>
			this.iframe.addEventListener('load', () => resolve())
		)

		if (this.url) this.setUrl(this.url)
		if (this.options.html) this.iframe.srcdoc = this.options.html

		this.iframe.width = '100%'
		this.iframe.style.display = 'none'
		this.iframe.style.position = 'absolute'
		this.iframe.classList.add('outlined')
		this.iframe.style.borderRadius = '12px'
		this.iframe.style.margin = '8px'
		getFullScreenElement()?.appendChild(this.iframe)
	}

	getOptions() {
		return this.options
	}
	setOpenWithPayload(payload?: IOpenWithPayload) {
		this.options.openWithPayload = payload
		if (payload) this.api.triggerOpenWith()
	}

	async setup() {
		await super.setup()
	}
	async onActivate() {
		await super.onActivate()

		this.isLoading = true
		await this.loaded
		this.isLoading = false

		// Only show iframe if tab is still active
		if (this.isActive) this.iframe.style.display = 'block'
	}
	onDeactivate() {
		super.onDeactivate()
		this.iframe.style.display = 'none'
	}
	onDestroy() {
		getFullScreenElement()?.removeChild(this.iframe)
		this.api.dispose()
	}

	get icon() {
		return this.options.icon ?? 'mdi-web'
	}
	get iconColor() {
		return this.options.iconColor
	}
	get name() {
		return this.options.name ?? 'Web'
	}
	get url() {
		return this.options.url
	}
	set srcdoc(val: string) {
		this.api.loaded.resetSignal()
		this.iframe.srcdoc = val
	}
	set src(val: string) {
		this.api.loaded.resetSignal()
		this.iframe.src = val
	}

	setUrl(url: string) {
		this.iframe.src = url
	}

	async is(tab: Tab): Promise<boolean> {
		return tab instanceof IframeTab && tab.url === this.url
	}
}
