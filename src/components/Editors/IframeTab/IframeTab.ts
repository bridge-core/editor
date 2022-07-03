import { TabSystem } from '../../TabSystem/TabSystem'
import IframeTabComponent from './IframeTab.vue'
import { Tab } from '../../TabSystem/CommonTab'

interface IIframeTabOptions {
	icon: string
	name: string
	url: string
	iconColor: string
}

export class IframeTab extends Tab {
	component = IframeTabComponent

	protected iframe = document.createElement('iframe')
	protected loaded: Promise<void>

	constructor(parent: TabSystem, protected options: IIframeTabOptions) {
		super(parent)

		this.isTemporary = false
		this.iframe.setAttribute(
			'sandbox',
			'allow-scripts allow-same-origin allow-modals allow-popups allow-forms'
		)
		this.loaded = new Promise<void>((resolve) =>
			this.iframe.addEventListener('load', () => resolve())
		)
		this.iframe.src = this.url

		this.iframe.width = '100%'
		this.iframe.style.display = 'none'
		this.iframe.style.position = 'absolute'
		this.iframe.classList.add('outlined')
		this.iframe.style.borderRadius = '12px'
		this.iframe.style.margin = '8px'
		this.iframe.style.marginTop = '0'

		document.body.appendChild(this.iframe)
	}
	async setup() {
		await this.loaded
		await super.setup()
	}
	async onActivate() {
		this.iframe.style.display = 'block'
	}
	onDeactivate() {
		this.iframe.style.display = 'none'
	}
	onDestroy() {
		document.body.removeChild(this.iframe)
	}

	get icon() {
		return this.options.icon
	}
	get iconColor() {
		return this.options.iconColor
	}
	get name() {
		return this.options.name
	}
	get url() {
		return this.options.url
	}

	async is(tab: Tab) {
		return tab instanceof IframeTab && tab.url === this.url
	}
}
