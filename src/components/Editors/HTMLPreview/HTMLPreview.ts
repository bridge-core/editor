import { TabSystem } from '../../TabSystem/TabSystem'
import { IDisposable } from '/@/types/disposable'
import type { ThemeManager } from '/@/components/Extensions/Themes/ThemeManager'
import { IframeTab } from '../IframeTab/IframeTab'
import { Tab } from '../../TabSystem/CommonTab'
import { AnyFileHandle } from '../../FileSystem/Types'
import { iframeApiVersion } from '/@/utils/app/iframeApiVersion'
import { translate } from '../../Locales/Manager'

export class HTMLPreviewTab extends IframeTab {
	public rawHtml = ''

	protected defaultStyles = ``
	protected themeListener?: IDisposable
	protected fileListener?: IDisposable
	protected messageListener?: IDisposable
	protected scrollY = 0
	constructor(
		parent: TabSystem,
		protected previewOptions: {
			filePath?: string
			fileHandle: AnyFileHandle
		}
	) {
		super(parent)

		const themeManager = parent.app.themeManager
		this.updateDefaultStyles(themeManager)
		this.themeListener = themeManager.on(() =>
			this.updateDefaultStyles(themeManager)
		)

		if (previewOptions.filePath)
			this.fileListener = parent.app.project.fileChange.on(
				previewOptions.filePath,
				async (file) => {
					await this.load(file)
				}
			)

		this.api.loaded.once(() => {
			this.api.on('saveScrollPosition', (scrollY) => {
				if (scrollY !== 0) this.scrollY = scrollY
			})
		})
	}

	async setup() {
		await this.load()

		await super.setup()
	}
	async onActivate() {
		await super.onActivate()
		await this.api.loaded.fired

		this.api.trigger('loadScrollPosition', this.scrollY)
	}
	onDeactivate() {
		this.messageListener?.dispose()
		this.messageListener = undefined

		super.onDeactivate()
	}

	onDestroy() {
		this.themeListener?.dispose()
		this.themeListener = undefined
		this.fileListener?.dispose()
		this.fileListener = undefined
	}

	get icon() {
		return 'mdi-language-html5'
	}
	get iconColor() {
		return 'behaviorPack'
	}
	get name() {
		return `${translate('preview.name')}: ${this.fileHandle.name}`
	}
	get fileHandle() {
		return this.previewOptions.fileHandle
	}

	get html() {
		return (
			this.rawHtml.replaceAll('href="#', 'href="about:srcdoc#') +
			`<link
				rel="stylesheet"
				href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900"
			/>` +
			`<style>${this.defaultStyles}</style>` +
			`<script type="module">
				import { Channel } from "https://unpkg.com/bridge-iframe-api@${iframeApiVersion}/dist/bridge-iframe-api.es.js"

				const channel = new Channel()

				await channel.connect()
	
				window.addEventListener('scroll', () => {
					channel.simpleTrigger('saveScrollPosition', window.scrollY)
				})
			
				channel.on('loadScrollPosition', (scrollY) => {
					window.scrollTo(0, scrollY)
				})
			</script>`
		)
	}
	updateDefaultStyles(themeManager: ThemeManager) {
		this.defaultStyles = `html {
			color: ${themeManager.getColor('text')};
			font-family: Roboto;
		}
		
		a {
			color: ${themeManager.getColor('primary')};
		}
	
		textarea, input {
			background-color: ${themeManager.getColor('background')};
			color: ${themeManager.getColor('text')};
		}`

		if (this.rawHtml !== '') this.updateHtml()
	}

	async updateHtml() {
		this.srcdoc = this.html

		await this.api.loaded.fired
		this.api.trigger('loadScrollPosition', this.scrollY)
	}

	async load(file?: File) {
		if (!file) file = await this.fileHandle.getFile()
		this.rawHtml = await file.text()

		this.updateHtml()
	}

	async is(tab: Tab): Promise<boolean> {
		return (
			tab instanceof HTMLPreviewTab &&
			(await tab.fileHandle.isSameEntry(<any>this.fileHandle))
		)
	}
}
