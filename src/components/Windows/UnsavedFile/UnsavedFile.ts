import UnsavedFileComponent from './UnsavedFile.vue'
import { App } from '/@/App'
import { BaseWindow } from '../BaseWindow'
import { Tab } from '/@/components/TabSystem/CommonTab'

const tabs = new WeakMap<UnsavedFileWindow, Tab>()

export class UnsavedFileWindow extends BaseWindow<'cancel' | 'close' | 'save'> {
	constructor(tab: Tab) {
		super(UnsavedFileComponent, true, false)
		tabs.set(this, tab)
		this.defineWindow()
		this.open()
	}

	get tab() {
		return tabs.get(this)
	}

	async noSave() {
		//new Audio('/audio/click5.ogg').play()
		this.close('close')

		const app = await App.getApp()
		await app.tabSystem?.close(this.tab, false)
	}
	async save() {
		new Audio('/audio/confirmation_002.ogg').play()
		this.close('save')

		const app = await App.getApp()
		await app.tabSystem?.save(this.tab)
		await app.tabSystem?.close(this.tab, false)
	}
	async cancel() {
		//new Audio('/audio/click5.ogg').play()
		this.close('cancel')
	}
}
