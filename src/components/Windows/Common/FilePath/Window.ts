import { BaseWindow } from '/@/components/Windows/BaseWindow'
import FilePathWindowComponent from './Window.vue'

export class FilePathWindow extends BaseWindow<string | null> {
	protected currentFilePath: string

	constructor(startPath?: string, protected isPersistent = true) {
		super(FilePathWindowComponent, true, false)
		this.currentFilePath = startPath ?? ''
		this.defineWindow()
		this.open()
	}
}
