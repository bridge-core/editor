import { App } from '@/App'
import { Signal } from '@/appCycle/EventSystem'
import * as Comlink from 'comlink'
import Vue from 'vue'
import { settingsState } from '../Windows/Settings/SettingsState'
import { PackIndexerService } from './Worker/Main'

const TaskService = Comlink.wrap<typeof PackIndexerService>(
	new Worker('./Worker/Main.ts', {
		type: 'module',
	})
)

export const packIndexerReady = Vue.observable({ isReady: false })

export class PackIndexer extends Signal<void> {
	protected _service!: Comlink.Remote<PackIndexerService>

	start(projectName: string, forceRefreshCache = false) {
		console.time('[TASK] Indexing Packs (Total)')
		this.resetSignal()
		packIndexerReady.isReady = false
		App.ready.once(async app => {
			const task = app.taskManager.create({
				icon: 'mdi-flash-outline',
				name: 'windows.taskManager.tasks.packIndexing.title',
				description:
					'windows.taskManager.tasks.packIndexing.description',
			})

			// Instaniate the worker TaskService
			this._service = await new TaskService(
				await app.fileSystem.getDirectoryHandle(
					`projects/${projectName}`
				),
				app.fileSystem.baseDirectory,
				{
					disablePackSpider: !settingsState?.general
						?.enablePackSpider,
					noFullLightningCacheRefresh:
						!forceRefreshCache &&
						!settingsState?.general?.fullLightningCacheRefresh,
				}
			)
			// Listen to task progress and update UI
			this._service.on(
				Comlink.proxy(([current, total]) => {
					if (current === total) task.complete()
					task.update(current, total)
				}),
				false
			)

			// Start service
			await this.service.start()
			packIndexerReady.isReady = true
			this.dispatch()
			console.timeEnd('[TASK] Indexing Packs (Total)')
		})
	}

	async updateFile(filePath: string) {
		await this.service.updateFile(filePath)
		App.eventSystem.dispatch('fileUpdated', filePath)
	}

	readdir(path: string[], ...args: any[]) {
		return this.service.readdir(path)
	}

	get service() {
		return this._service
	}
}
