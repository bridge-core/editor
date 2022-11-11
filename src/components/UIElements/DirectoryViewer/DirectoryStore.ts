import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { DirectoryWrapper } from './DirectoryView/DirectoryWrapper'
import { markRaw } from 'vue'
import type { FileWrapper } from './FileView/FileWrapper'
import type { IFileDiagnostic } from '/@/components/PackIndexer/Worker/PackSpider/PackSpider'
import { VirtualHandle } from '/@/components/FileSystem/Virtual/Handle'
import { TActionConfig } from '../../ContextMenu/showContextMenu'
import { isSameEntry } from '/@/utils/file/isSameEntry'

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
	onDirectoryRightClick?: (
		event: MouseEvent,
		directoryWrapper: DirectoryWrapper
	) => Promise<void> | void
	onHandleMoved?: (opts: IHandleMovedOptions) => Promise<void> | void
	onFilesAdded?: (filePaths: string[]) => Promise<void> | void

	/**
	 * Add new items to the bottom of the file context menu
	 */
	provideFileContextMenu?: (
		fileWrapper: FileWrapper
	) => Promise<TActionConfig[]> | TActionConfig[]
	/**
	 * Add new items to the bottom of the directory context menu
	 */
	provideDirectoryContextMenu?: (
		directoryWrapper: DirectoryWrapper
	) => Promise<TActionConfig[]> | TActionConfig[]

	/**
	 * Show file diagnostics within the directory viewer
	 */
	provideFileDiagnostics?: (
		fileWrapper: FileWrapper
	) => Promise<IFileDiagnostic[]> | IFileDiagnostic[]
}

export interface IHandleMovedOptions {
	fromPath: string
	toPath: string
	movedHandle: FileSystemHandle | VirtualHandle
	fromHandle: AnyDirectoryHandle
	toHandle: AnyDirectoryHandle
}

export class DirectoryStore {
	protected static cache = new Map<AnyDirectoryHandle, DirectoryWrapper>()

	protected static async getCachedDirectoryHandle(
		directoryHandle: AnyDirectoryHandle
	) {
		for (const [currDirhandle, currWrapper] of this.cache.entries()) {
			if (await isSameEntry(currDirhandle, directoryHandle)) {
				await currWrapper.refresh()
				return currWrapper
			}
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
