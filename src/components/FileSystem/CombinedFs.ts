/**
 * A FileSystem that switches between the dataLoader virtual FS & normal FS based on the file path
 */
import { IGetHandleConfig } from './Common'
import { AnyDirectoryHandle } from './Types'
import { DataLoader } from '/@/components/Data/DataLoader'
import { FileSystem } from '/@/components/FileSystem/FileSystem'

export class CombinedFileSystem extends FileSystem {
	constructor(
		baseDirectory: AnyDirectoryHandle,
		protected dataLoader: DataLoader
	) {
		super(baseDirectory)
	}

	getDirectoryHandle(path: string, opts: IGetHandleConfig) {
		if (path.startsWith('data/packages/'))
			return this.dataLoader.getDirectoryHandle(path, opts)
		else if (path.startsWith('file:///data/packages/'))
			return this.dataLoader.getDirectoryHandle(path.slice(8), opts)
		else return super.getDirectoryHandle(path, opts)
	}
}
