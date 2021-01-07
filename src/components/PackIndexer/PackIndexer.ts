import { App } from '@/App'
import * as Comlink from "comlink"
import type { PackIndexerService } from "./Worker"

const TaskService = Comlink.wrap<typeof PackIndexerService>(new Worker('./Worker.ts', {
	type: 'module',
}))

export class PackIndexer {
	protected service!: Comlink.Remote<PackIndexerService>
	start() {
		App.ready.once(async app => {
			const task = app.taskManager.create({
				icon: 'mdi-flash-outline',
				name: 'Indexing Packs',
				description:
					'bridge. is collecting data about your pack that is needed for its intelligent features.',
			})
			this.service = await new TaskService(await app.fileSystem.getDirectoryHandle("projects/test"))
			this.service.on(Comlink.proxy(([current, total]) => {
				if(current === total) task.complete()
				task.update(current, total)
			}), false)

			await this.service.start()
		})
	}
}
