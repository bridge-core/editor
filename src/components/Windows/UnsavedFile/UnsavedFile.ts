import UnsavedFileComponent from './UnsavedFile.vue'
import { App } from '/@/App'
import { BaseWindow } from '../BaseWindow'
import { Tab } from '/@/components/TabSystem/CommonTab'

export class UnsavedFileWindow extends BaseWindow<'cancel' | 'close' | 'save'> {
	constructor(protected tab: Tab) {
		super(UnsavedFileComponent, true, false)
		this.defineWindow()
		this.open()
	}

	async noSave() {
		this.close('close')

		const app = await App.getApp()
		await app.tabSystem?.close(this.tab, false)
	}
	async save() {
		this.close('save')

		const app = await App.getApp()
		await app.tabSystem?.save(this.tab)
		await app.tabSystem?.close(this.tab, false)
	}
	async cancel() {
		this.close('cancel')
	}
}
