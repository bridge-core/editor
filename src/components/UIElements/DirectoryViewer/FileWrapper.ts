import { AnyFileHandle } from '../../FileSystem/Types'
import { BaseWrapper } from './BaseWrapper'
import type { IDirectoryViewerOptions } from './DirectoryStore'
import type { DirectoryWrapper } from './DirectoryWrapper'
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

	async openFile() {
		const app = await App.getApp()

		await app.project.openFile(this.handle, { selectTab: true })
	}

	get icon() {
		const path = this.path
		if (!path) return 'mdi-file-outline'

		return App.fileType.get(path)?.icon ?? 'mdi-file-outline'
	}

	onRightClick() {
		this.options.onFileRightClick?.(this)
	}
}
