import { VirtualDirectoryHandle } from '../Data/VirtualFs/DirectoryHandle'
import { VirtualFileHandle } from '../Data/VirtualFs/FileHandle'
import { VirtualHandle } from '../Data/VirtualFs/Handle'

export type AnyHandle = FileSystemHandle | VirtualHandle
export type AnyDirectoryHandle =
	| FileSystemDirectoryHandle
	| VirtualDirectoryHandle
export type AnyFileHandle = FileSystemFileHandle | VirtualFileHandle
