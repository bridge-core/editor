import { inject, markRaw } from 'vue'
import { App } from '/@/App'
import { Signal } from '/@/components/Common/Event/Signal'

interface ILangKey {
	formats: string[]
	inject: {
		name: string
		fileType: string
		cacheKey: string
	}[]
}

export class LangData extends Signal<void> {
	protected _data?: any

	async loadLangData(packageName: string) {
		const app = await App.getApp()

		this._data = markRaw(
			await app.dataLoader.readJSON(
				`data/packages/${packageName}/language/lang/main.json`
			)
		)

		this.dispatch()
	}

	async getValidLangKeys() {
		if (!this._data) return []

		let keys: string[] = []
		for (const keyDef of this._data.keys as ILangKey[]) {
			keys = keys.concat(await this.generateKeys(keyDef))
		}
		return keys
	}

	async generateKeys(key: ILangKey) {
		const app = await App.getApp()
		const packIndexer = app.project.packIndexer

		await packIndexer.fired

		// Find out what data to use for these keys
		let keys: string[] = []
		for (const fromCache of key.inject) {
			const fetchedData =
				(await packIndexer.service.getCacheDataFor(
					fromCache.fileType,
					undefined,
					fromCache.cacheKey
				)) ?? []
			for (const format of key.formats) {
				keys = keys.concat(
					fetchedData.map((data: string) =>
						format.replace(`{{${fromCache.name}}}`, data)
					)
				)
			}
		}

		return keys
	}
}
