import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { BaseWrapper } from '../Common/BaseWrapper'
import type { IDirectoryViewerOptions } from '../DirectoryStore'
import type { DirectoryWrapper } from '../DirectoryView/DirectoryWrapper'
import { App } from '/@/App'
import { showFileContextMenu } from '../ContextMenu/File'
import { extname } from '/@/utils/path'

const extIconMap: Record<string, string[]> = {
	'mdi-file-image-outline': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tga'],
	'mdi-code-json': ['.json'],
	'mdi-volume-high': ['.mp3', '.wav', '.fsb', '.ogg'],
	'mdi-language-html5': ['.html'],
	'mdi-language-typescript': ['.ts', '.tsx'],
	'mdi-language-javascript': ['.js', '.jsx'],
	'mdi-web': ['.lang']
}

export class FileWrapper extends BaseWrapper<AnyFileHandle> {
	public readonly kind = 'file'

	constructor(
		parent: DirectoryWrapper,
		fileHandle: AnyFileHandle,
		options: IDirectoryViewerOptions
	) {
		super(parent, fileHandle, options)
	}

	get icon() {
		const path = this.path
		if (!path) return this.getDefaultIcon()

		return App.fileType.get(path)?.icon ?? this.getDefaultIcon()
	}

	getDefaultIcon() {
		let name = this.handle.name

		const ext = extname(name)
		for (const [icon, exts] of Object.entries(extIconMap)) {
			if (exts.includes(ext)) return icon
		}

		return 'mdi-file-outline'
	}

	async openFile(persistFile=false) {
		const app = await App.getApp()

		await app.project.openFile(this.handle, {
			selectTab: true,
			isReadOnly: this.options.isReadOnly,
			isTemporary: !persistFile,
		})
	}

	override _onRightClick(event: MouseEvent) {
		showFileContextMenu(event, this)

		this.options.onFileRightClick?.(event, this)
	}
	override async _onClick(event: MouseEvent, forceClick: boolean) {
		if(forceClick) {
			const app = await App.getApp()

			const currentTab = app.project.tabSystem?.selectedTab
			if (currentTab && currentTab.isTemporary)
				currentTab.isTemporary = false
		}
		this.openFile()
	}
	override unselectAll(): void {
		this.parent?.unselectAll()
	}
}
