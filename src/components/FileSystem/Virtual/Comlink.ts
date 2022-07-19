import { TransferHandler, transferHandlers } from 'comlink'
import { IDirectory, IQueryResult } from '../../FindAndReplace/Worker/Worker'
import { AnyDirectoryHandle } from '../Types'
import { VirtualDirectoryHandle } from './DirectoryHandle'
import { VirtualFileHandle } from './FileHandle'

export interface ISerializedFileHandle {
	kind: 'file'
	name: string
	path: string[]
	fileData?: Uint8Array
	idbWrapper?: string
}

transferHandlers.set('VirtualFileHandle', <
	TransferHandler<VirtualFileHandle, ISerializedFileHandle>
>{
	canHandle: (obj): obj is VirtualFileHandle =>
		obj instanceof VirtualFileHandle,
	serialize: (obj) => {
		return [obj.serialize(), []]
	},
	deserialize: (obj) => new VirtualFileHandle(null, obj.name, obj.fileData),
})

export interface ISerializedDirectoryHandle {
	kind: 'directory'
	name: string
	path: string[]
	idbWrapper?: string
	children?: (ISerializedFileHandle | ISerializedDirectoryHandle)[]
}

transferHandlers.set('VirtualDirectoryHandle', <
	TransferHandler<VirtualDirectoryHandle, ISerializedDirectoryHandle>
>{
	canHandle: (obj): obj is VirtualDirectoryHandle => {
		return obj instanceof VirtualDirectoryHandle
	},

	serialize: (obj) => {
		return [obj.serialize(), []]
	},
	deserialize: (obj) => VirtualDirectoryHandle.deserialize(obj),
})

/**
 * Make IDirectory[] work for Find & Replace tab
 */
interface IVirtualDirectoryHandleArray {
	directory: VirtualDirectoryHandle
	[key: string]: any
}
interface ISerializedDirectoryHandleArray {
	directory: ISerializedDirectoryHandle
	[key: string]: any
}
transferHandlers.set('VirtualDirectoryHandleArray', <
	TransferHandler<
		IVirtualDirectoryHandleArray[],
		ISerializedDirectoryHandleArray[]
	>
>{
	canHandle: (arr): arr is IVirtualDirectoryHandleArray[] => {
		return (
			Array.isArray(arr) &&
			arr.every(
				({ directory }) => directory instanceof VirtualDirectoryHandle
			)
		)
	},

	serialize: (arr) => {
		return [
			arr.map(({ directory, ...other }) => ({
				directory: directory.serialize(),
				...other,
			})),
			[],
		]
	},
	deserialize: (arr) =>
		arr.map(({ directory, ...other }) => ({
			directory: VirtualDirectoryHandle.deserialize(directory),
			...other,
		})),
})

/**
 * Make IQueryResult transfer correctly
 */
interface IVirtualFileHandleArray {
	fileHandle: VirtualFileHandle
	[key: string]: any
}
interface ISerializedVirtualFileHandleArray {
	fileHandle: ISerializedFileHandle
	[key: string]: any
}
transferHandlers.set('VirtualFileHandleArray', <
	TransferHandler<
		IVirtualFileHandleArray[],
		ISerializedVirtualFileHandleArray[]
	>
>{
	canHandle: (arr): arr is IVirtualFileHandleArray[] => {
		return (
			Array.isArray(arr) &&
			arr.every(
				({ fileHandle }) => fileHandle instanceof VirtualFileHandle
			)
		)
	},

	serialize: (arr) => {
		return [
			arr.map(({ fileHandle, ...other }) => ({
				fileHandle: fileHandle.serialize(),
				...other,
			})),
			[],
		]
	},
	deserialize: (arr) =>
		arr.map(({ fileHandle, ...other }) => ({
			fileHandle: VirtualFileHandle.deserialize(fileHandle),
			...other,
		})),
})
