import { App } from '@/App'

export class PackIndexer {
	protected worker = new Worker('./Worker.ts', {
		type: 'module',
	})
	start() {
		App.ready.once(app => {
			const task = app.taskManager.create({
				icon: 'mdi-flash-outline',
				name: 'Indexing Packs',
				description:
					'bridge. is collecting data about your pack that is needed for its intelligent features.',
			})
			this.worker.postMessage(app.fileSystem.baseDirectory)
			this.worker.addEventListener('message', event => {
				if (event.data.isDone) return task.complete()
				else if (event.data.progress)
					task.update(
						event.data.progress.current,
						event.data.progress.total
					)
			})
		})
	}
}
