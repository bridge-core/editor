import * as Comlink from 'comlink'
import { TaskService } from '@/components/TaskManager/WorkerTask'

export interface IWorkerSettings {
	config: string
}

export class CompilerService extends TaskService<void> {
	constructor(
		projectDirectory: FileSystemDirectoryHandle,
		protected baseDirectory: FileSystemDirectoryHandle,
		readonly settings: IWorkerSettings
	) {
		super('compiler', projectDirectory)
	}

	async onStart() {}
}

Comlink.expose(CompilerService, self)
