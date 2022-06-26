import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { BaseWrapper } from '../Common/BaseWrapper'
import type { IDirectoryViewerOptions } from '../DirectoryStore'
import type { DirectoryWrapper } from '../DirectoryView/DirectoryWrapper'
import { App } from '/@/App'

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
		if (!path) return 'mdi-file-outline'

		return App.fileType.get(path)?.icon ?? 'mdi-file-outline'
	}

	async openFile(persistFile=false) {
		const app = await App.getApp()

		await app.project.openFile(this.handle, {
			selectTab: true,
			isReadOnly: this.options.isReadonly,
			isTemporary: !persistFile,
		})
	}

	override _onRightClick(event: MouseEvent) {
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
