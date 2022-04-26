import { VirtualDirectoryHandle } from './Virtual/DirectoryHandle'
import { VirtualFileHandle } from './Virtual/FileHandle'
import { VirtualHandle } from './Virtual/Handle'

export type AnyHandle =
	| FileSystemFileHandle
	| FileSystemDirectoryHandle
	| VirtualHandle
export type AnyDirectoryHandle =
	| FileSystemDirectoryHandle
	| VirtualDirectoryHandle
export type AnyFileHandle = FileSystemFileHandle | VirtualFileHandle
