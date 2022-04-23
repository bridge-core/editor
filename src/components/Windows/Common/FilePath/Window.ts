import { BaseWindow } from '/@/components/Windows/BaseWindow'
import FilePathWindowComponent from './Window.vue'
import { basename, extname } from '/@/utils/path'

export interface IFilePathWinConfig {
	fileName?: string
	startPath?: string
	isPersistent?: boolean
}
export interface IChangedFileData {
	filePath: string
	fileName?: string
}

export class FilePathWindow extends BaseWindow<IChangedFileData | null> {
	protected fileName?: string
	protected fileExt?: string
	protected currentFilePath: string
	protected isPersistent = false
	protected hasFilePath = false

	constructor({
		fileName,
		startPath = '',
		isPersistent = false,
	}: IFilePathWinConfig) {
		super(FilePathWindowComponent, true, false)
		this.currentFilePath = startPath
		this.isPersistent = isPersistent

		if (fileName) {
			this.hasFilePath = true
			this.fileExt = extname(fileName)
			this.fileName = basename(fileName, this.fileExt)
		}

		this.defineWindow()
		this.open()
	}

	startCloseWindow(skippedDialog: boolean) {
		return this.close(
			skippedDialog
				? null
				: { filePath: this.currentFilePath, fileName: this.hasFilePath ? `${this.fileName}${this.fileExt}` : undefined }
		)
	}
}
