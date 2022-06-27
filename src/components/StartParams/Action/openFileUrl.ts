import { basename } from '/@/utils/path'
import type { IStartAction } from '../Manager'
import { VirtualFileHandle } from '/@/components/FileSystem/Virtual/FileHandle'
import { App } from '/@/App'

export const openFileUrl: IStartAction = {
	type: 'raw',
	name: 'openFileUrl',

	onTrigger: async (value: string) => {
		const resp = await fetch(value).catch(() => null)
		if (!resp) return

		const file = new VirtualFileHandle(
			null,
			basename(value),
			new Uint8Array(await resp.arrayBuffer()),
			true
		)

		const app = await App.getApp()
		await app.projectManager.projectReady.fired

		await app.fileDropper.importFile(file)
	},
}
