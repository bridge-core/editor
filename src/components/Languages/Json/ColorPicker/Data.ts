import { markRaw } from 'vue'
import { App } from '/@/App'
import { Signal } from '/@/components/Common/Event/Signal'

export class ColorData extends Signal<void> {
	protected _data?: any

	async loadColorData() {
		const app = await App.getApp()

		this._data = markRaw(
			await app.dataLoader.readJSON(
				`data/packages/minecraftBedrock/location/validColor.json`
			)
		)

		this.dispatch()
	}

	async getDataForCurrentTab() {
		await this.fired

		const app = await App.getApp()

		const currentTab = app.project.tabSystem?.selectedTab
		if (!currentTab) return {}

		// Get the file definition id of the currently opened tab
		const id = App.fileType.getId(currentTab.getPath())

		// Get the color locations for this file type
		return this._data[id]
	}
}
