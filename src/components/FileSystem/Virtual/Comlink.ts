import { TransferHandler, transferHandlers } from 'comlink'
import { VirtualDirectoryHandle } from './DirectoryHandle'
import { VirtualFileHandle } from './FileHandle'

export interface ISerializedFileHandle {
	kind: 'file'
	name: string
	data: Uint8Array
}

transferHandlers.set('VirtualFileHandle', <
	TransferHandler<VirtualFileHandle, ISerializedFileHandle>
>{
	canHandle: (obj): obj is VirtualFileHandle =>
		obj instanceof VirtualFileHandle,
	serialize: (obj) => {
		return [obj.serialize(), []]
	},
	deserialize: (obj) => new VirtualFileHandle(null, obj.name, obj.data),
})

export interface ISerializedDirectoryHandle {
	kind: 'directory'
	name: string
	children: (ISerializedFileHandle | ISerializedDirectoryHandle)[]
}

transferHandlers.set('VirtualDirectoryHandle', <
	TransferHandler<VirtualDirectoryHandle, ISerializedDirectoryHandle>
>{
	canHandle: (obj): obj is VirtualDirectoryHandle =>
		obj instanceof VirtualDirectoryHandle,

	serialize: (obj) => {
		return [obj.serialize(), []]
	},
	deserialize: (obj) => VirtualDirectoryHandle.deserialize(obj),
})
