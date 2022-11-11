import FilePathWindowComponent from './Window.vue'
import { basename, extname } from '/@/utils/path'
import { NewBaseWindow } from '../../NewBaseWindow'
import { reactive } from 'vue'

export interface IFilePathWinConfig {
	fileName?: string
	startPath?: string
	isPersistent?: boolean
}
export interface IChangedFileData {
	filePath: string
	fileName?: string
}

export class FilePathWindow extends NewBaseWindow<IChangedFileData | null> {
	protected fileExt?: string
	protected isPersistent = false
	protected hasFilePath = false

	protected state = reactive<any>({
		...super.state,
		fileName: '',
		currentFilePath: '',
	})

	constructor({
		fileName,
		startPath = '',
		isPersistent = false,
	}: IFilePathWinConfig) {
		super(FilePathWindowComponent, true, false)
		this.state.currentFilePath = startPath
		this.isPersistent = isPersistent

		if (fileName) {
			this.hasFilePath = true
			this.fileExt = extname(fileName)
			this.state.fileName = basename(fileName, this.fileExt)
		}

		this.defineWindow()
		this.open()
	}

	startCloseWindow(skippedDialog: boolean) {
		return this.close(
			skippedDialog
				? null
				: {
						filePath: this.state.currentFilePath,
						fileName: this.hasFilePath
							? `${this.state.fileName}${this.fileExt}`
							: undefined,
				  }
		)
	}
}
