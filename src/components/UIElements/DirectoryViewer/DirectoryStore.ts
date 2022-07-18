import { AnyDirectoryHandle, AnyHandle } from '/@/components/FileSystem/Types'
import { DirectoryWrapper } from './DirectoryView/DirectoryWrapper'
import { markRaw } from '@vue/composition-api'
import type { FileWrapper } from './FileView/FileWrapper'
import { IActionConfig } from '/@/components/Actions/SimpleAction'
import type { IFileDiagnostic } from '/@/components/PackIndexer/Worker/PackSpider/PackSpider'
import { VirtualHandle } from '/@/components/FileSystem/Virtual/Handle'

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
	onHandleMoved?: (opts: IMoveOptions) => Promise<void> | void
	/**
	 * Add new items to the bottom of the file context menu
	 */
	provideFileContextMenu?: (
		fileWrapper: FileWrapper
	) => (
		| IActionConfig
		| {
				type: 'divider'
		  }
		| null
	)[]
	/**
	 * Add new items to the bottom of the directory context menu
	 */
	provideDirectoryContextMenu?: (
		directoryWrapper: DirectoryWrapper
	) => (
		| IActionConfig
		| {
				type: 'divider'
		  }
		| null
	)[]

	/**
	 * Show file diagnostics within the directory viewer
	 */
	provideFileDiagnostics?: (
		fileWrapper: FileWrapper
	) => Promise<IFileDiagnostic[]> | IFileDiagnostic[]
}

interface IMoveOptions {
	fromPath: string
	toPath: string
	movedHandled: FileSystemHandle | VirtualHandle
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
