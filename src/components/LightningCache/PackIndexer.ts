import { App } from '@/App'
import * as Comlink from "comlink"
import type { PackIndexerService } from "./Worker/Main"

const TaskService = Comlink.wrap<typeof PackIndexerService>(new Worker('./Worker/Main.ts', {
	type: 'module',
}))

export class PackIndexer {
	protected service!: Comlink.Remote<PackIndexerService>
	start() {
		App.ready.once(async app => {
			const task = app.taskManager.create({
				icon: 'mdi-flash-outline',
				name: 'windows.taskManager.tasks.packIndexing.title',
				description:
					'windows.taskManager.tasks.packIndexing.description',
			})

			// Instaniate the worker TaskService
			this.service = await new TaskService(await app.fileSystem.getDirectoryHandle("projects/test"))
			// Listen to task progress and update UI
			this.service.on(Comlink.proxy(([current, total]) => {
				if(current === total) task.complete()
				task.update(current, total)
			}), false)

			// Start service
			await this.service.start()
		})
	}
}
