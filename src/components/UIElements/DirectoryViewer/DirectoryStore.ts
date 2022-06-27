import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { DirectoryWrapper } from './DirectoryView/DirectoryWrapper'
import { markRaw } from '@vue/composition-api'
import type { FileWrapper } from './FileView/FileWrapper'

export interface IDirectoryViewerOptions {
	startPath?: string
	isReadOnly?: boolean
	defaultIconColor?: string

	// TODO: mode for selecting files/folders
	mode?: 'view-directory' // | 'select-file' | 'select-folder'
	// multiple?: boolean

	onFileRightClick?: (
		event: MouseEvent,
		fileWrapper: FileWrapper
	) => Promise<void> | void
	onFolderRightClick?: (
		event: MouseEvent,
		directoryWrapper: DirectoryWrapper
	) => Promise<void> | void
	onHandleMoved?: (opts: IMoveOptions) => Promise<void> | void
}

interface IMoveOptions {
	fromPath: string
	toPath: string
	fromHandle: AnyDirectoryHandle
	toHandle: AnyDirectoryHandle
}

export class DirectoryStore {
	protected static cache = new Map<AnyDirectoryHandle, DirectoryWrapper>()

	protected static async getCachedDirectoryHandle(
		directoryHandle: AnyDirectoryHandle
	) {
		for (const [currDirhandle, currWrapper] of this.cache.entries()) {
			// @ts-ignore
			if (await currDirhandle.isSameEntry(directoryHandle))
				return currWrapper
		}

		return null
	}

	static async getDirectory(
		directoryHandle: AnyDirectoryHandle,
		options: IDirectoryViewerOptions = {}
	) {
		const fromCache = await this.getCachedDirectoryHandle(directoryHandle)
		if (fromCache) return fromCache

		const wrapper = new DirectoryWrapper(null, directoryHandle, options)
		await wrapper.open()
		this.cache.set(directoryHandle, markRaw(wrapper))

		return wrapper
	}

	static async disposeDirectory(directoryHandle: AnyDirectoryHandle) {
		this.cache.delete(directoryHandle)
	}
}
