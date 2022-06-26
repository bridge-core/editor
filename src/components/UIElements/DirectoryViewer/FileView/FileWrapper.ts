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

	async openFile() {
		const app = await App.getApp()

		await app.project.openFile(this.handle, {
			selectTab: true,
			isReadOnly: this.options.isReadonly,
		})
	}

	onRightClick(event: MouseEvent) {
		this.options.onFileRightClick?.(event, this)
	}
}
