import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { BaseWrapper } from '../Common/BaseWrapper'
import type { IDirectoryViewerOptions } from '../DirectoryStore'
import type { DirectoryWrapper } from '../DirectoryView/DirectoryWrapper'
import { App } from '/@/App'
import { showFileContextMenu } from '../ContextMenu/File'
import { getDefaultFileIcon } from '/@/utils/file/getIcon'


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
		if (!path) return getDefaultFileIcon(this.handle.name)

		return App.fileType.get(path)?.icon ?? getDefaultFileIcon(this.handle.name)
	}

	async getFirstDiagnostic() {
		// TODO: Disabled until we find time to polish the feature
		return null
		// const diagnostics = await this.options.provideFileDiagnostics?.(this)

		// return diagnostics?.[0]
	}

	async openFile(persistFile=false) {
		const app = await App.getApp()

		await app.project.openFile(this.handle, {
			selectTab: true,
			readOnlyMode: this.options.isReadOnly ? 'forced' : 'off',
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
