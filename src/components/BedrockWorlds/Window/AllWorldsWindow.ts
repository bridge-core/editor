import { markRaw } from '@vue/composition-api'
import { AnyDirectoryHandle } from '../../FileSystem/Types'
import { BaseWindow } from '../../Windows/BaseWindow'
import AllWorldsComponent from './AllWorlds.vue'
import { App } from '/@/App'

export interface IWorldData {
	name: string
	previewImage: string
	directoryHandle: AnyDirectoryHandle
}

export class AllWorldsWindow extends BaseWindow {
	protected worlds: IWorldData[] = []

	constructor() {
		super(AllWorldsComponent, true, false)
		this.defineWindow()
		this.open()
	}

	async open() {
		const app = await App.getApp()

		app.windows.loadingWindow.open()
		await this.loadWorlds()
		app.windows.loadingWindow.close()

		super.open()
	}

	async loadWorlds() {
		const app = await App.getApp()
		const fs = app.fileSystem
		const project = app.project

		this.worlds = []

		const worldHandle = await fs
			.getDirectoryHandle(
				project.config.resolvePackPath(undefined, 'worlds')
			)
			.catch(() => undefined)
		if (!worldHandle)
			throw new Error(
				`Invalid state: Worlds directory did not exist when AllWorldsWindow attempted to load them`
			)

		for await (const [handleName, handle] of worldHandle.entries()) {
			if (handle.kind !== 'directory') continue

			const worldName = await fs
				.readFile(
					project.config.resolvePackPath(
						undefined,
						`worlds/${handleName}/levelname.txt`
					)
				)
				.then((file) => file.text())
				.catch(() => handleName)

			this.worlds.push({
				name: worldName,
				directoryHandle: markRaw(handle),
				previewImage: await fs.loadFileHandleAsDataUrl(
					await fs.getFileHandle(
						project.config.resolvePackPath(
							undefined,
							`worlds/${handleName}/world_icon.jpeg`
						)
					)
				),
			})
		}
	}
}
