import UnsavedFileComponent from './UnsavedFile.vue'
import { App } from '/@/App'
import { Tab } from '/@/components/TabSystem/CommonTab'
import { NewBaseWindow } from '../NewBaseWindow'

const tabs = new WeakMap<UnsavedFileWindow, Tab>()

export class UnsavedFileWindow extends NewBaseWindow<
	'cancel' | 'close' | 'save'
> {
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
