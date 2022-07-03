import { TabSystem } from '../../TabSystem/TabSystem'
import { IDisposable } from '/@/types/disposable'
import type { ThemeManager } from '/@/components/Extensions/Themes/ThemeManager'
import { IframeTab } from '../IframeTab/IframeTab'
import { FileTab } from '../../TabSystem/FileTab'
import { addDisposableEventListener } from '/@/utils/disposableListener'
import { Tab } from '../../TabSystem/CommonTab'

export class HTMLPreviewTab extends IframeTab {
	public rawHtml = ''

	protected defaultStyles = ``
	protected themeListener?: IDisposable
	protected fileListener?: IDisposable
	protected messageListener?: IDisposable
	protected scrollY = 0
	constructor(protected tab: FileTab, parent: TabSystem) {
		super(parent)

		const themeManager = parent.app.themeManager
		this.updateDefaultStyles(themeManager)
		this.themeListener = themeManager.on(() =>
			this.updateDefaultStyles(themeManager)
		)
		this.fileListener = parent.app.project.fileChange.on(
			tab.getPath(),
			async () => {
				await this.load()
			}
		)
	}

	async setup() {
		await this.load()

		await super.setup()
	}
	async onActivate() {
		this.messageListener = addDisposableEventListener(
			'message',
			({ data: { type, scrollY } }) => {
				if (type !== 'saveScrollPosition' || scrollY === undefined)
					return

				this.updateScrollY(scrollY)
			}
		)
		this.iframe.contentWindow?.postMessage(
			{ type: 'loadScrollPosition', scrollY: this.scrollY },
			'*'
		)
		await super.onActivate()
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
		return `${this.parent.app.locales.translate('preview.name')}: ${
			this.fileHandle.name
		}`
	}
	get fileHandle() {
		return this.tab.getFileHandle()
	}

	get html() {
		return (
			this.rawHtml.replaceAll('href="#', 'href="about:srcdoc#') +
			`<link
				rel="stylesheet"
				href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900"
			/>` +
			`<style>${this.defaultStyles}</style>` +
			`<script>
				window.addEventListener('scroll', () => {
					window.top.postMessage({ type: 'saveScrollPosition', scrollY: window.scrollY }, '*')
				})
				window.addEventListener('message', ({ data: { type, scrollY } }) => {
					if (type !== 'loadScrollPosition' || scrollY === undefined) return
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
	}
	updateScrollY(scrollY: number) {
		this.scrollY = scrollY
	}

	async load() {
		this.rawHtml = await this.tab.getFile().then((file) => file.text())

		this.iframe.srcdoc = this.html
	}

	async is(tab: Tab): Promise<boolean> {
		return (
			tab instanceof HTMLPreviewTab &&
			(await tab.fileHandle.isSameEntry(<any>this.fileHandle))
		)
	}
}
