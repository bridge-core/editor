import { BaseWindow } from '../../BaseWindow'
import SelectProjectFolder from './Main.vue'

export class SelectProjectFolderWindow extends BaseWindow {
	constructor(
		protected callback: (
			fileHandle: FileSystemDirectoryHandle
		) => Promise<void> | void
	) {
		super(SelectProjectFolder)
		this.defineWindow()
	}
}
