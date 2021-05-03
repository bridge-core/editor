import { BaseWindow } from '/@/components/Windows/BaseWindow'
import FilePathWindowComponent from './Window.vue'

export class FilePathWindow extends BaseWindow<string> {
	protected currentFilePath: string

	constructor(startPath?: string) {
		super(FilePathWindowComponent, true, false)
		this.currentFilePath = startPath ?? ''
		this.defineWindow()
		this.open()
	}
}
