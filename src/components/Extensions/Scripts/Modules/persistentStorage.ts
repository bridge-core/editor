import { IModuleConfig } from '../types'
import { IDBWrapper } from '/@/components/FileSystem/Virtual/IDB'

export const idbExtensionStore = new IDBWrapper('persistent-extension-storage')

export const PersistentStorageModule = ({ extensionId }: IModuleConfig) => ({
	async save(data: any) {
		await idbExtensionStore.set(extensionId, data)
	},

	async load() {
		return await idbExtensionStore.get(extensionId)
	},

	async delete() {
		await idbExtensionStore.del(extensionId)
	},
})
