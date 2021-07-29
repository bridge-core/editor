/**
 * A FileSystem that switches between the dataLoader virtual FS & normal FS based on the file path
 */
import { DataLoader } from '/@/components/Data/DataLoader'
import { FileSystem } from '/@/components/FileSystem/FileSystem'

export class CombinedFileSystem {
	constructor(
		protected dataLoader: DataLoader,
		protected fileSystem: FileSystem
	) {}
}
