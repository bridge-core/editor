import { App } from '/@/App'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { IModuleConfig } from '../types'
import {
	AnyDirectoryHandle,
	AnyFileHandle,
} from '/@/components/FileSystem/Types'
import { VirtualFileHandle } from '/@/components/FileSystem/Virtual/FileHandle'
import { VirtualDirectoryHandle } from '/@/components/FileSystem/Virtual/DirectoryHandle'
import {
	ISerializedDirectoryHandle,
	ISerializedFileHandle,
} from '/@/components/FileSystem/Virtual/Comlink'

export const FSModule = ({ disposables }: IModuleConfig) => {
	return new Promise<FileSystem>((resolve) => {
		App.ready.once((app) => {
			const res: any = {
				onBridgeFolderSetup: (cb: () => Promise<void> | void) => {
					disposables.push(app.bridgeFolderSetup.once(cb, true))
				},
				serializeHandle(handle: AnyFileHandle | AnyDirectoryHandle) {
					if (
						handle instanceof VirtualFileHandle ||
						handle instanceof VirtualDirectoryHandle
					) {
						return handle.serialize()
					}

					return handle
				},
				deserializeHandle(
					serializedHandle:
						| FileSystemHandle
						| ISerializedFileHandle
						| ISerializedDirectoryHandle
				) {
					if (serializedHandle instanceof FileSystemHandle)
						return serializedHandle

					if (serializedHandle.kind === 'directory') {
						return VirtualDirectoryHandle.deserialize(
							serializedHandle
						)
					} else {
						return VirtualFileHandle.deserialize(serializedHandle)
					}
				},
			}

			// Extensions will destructure the fileSystem instance
			// so we actually need to add its methods to a temp object
			// and rebind them to the class instance
			for (const key of Object.getOwnPropertyNames(
				Object.getPrototypeOf(app.fileSystem)
			)) {
				if (
					key !== 'constructor' &&
					typeof (<any>app.fileSystem)[key] === 'function'
				)
					res[key] = (<any>app.fileSystem)[key].bind(app.fileSystem)
			}

			resolve(res)
		})
	})
}
