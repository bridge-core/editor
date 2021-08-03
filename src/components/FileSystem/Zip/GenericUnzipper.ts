import { ITaskDetails, Task } from '/@/components/TaskManager/Task'
import { TaskManager } from '/@/components/TaskManager/TaskManager'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { AnyDirectoryHandle } from '../Types'

export abstract class GenericUnzipper<T> {
	protected fileSystem: FileSystem
	protected task?: Task

	constructor(protected directory: AnyDirectoryHandle) {
		this.fileSystem = new FileSystem(directory)
	}

	createTask(
		taskManager: TaskManager,
		taskDetails: ITaskDetails = {
			icon: 'mdi-folder-zip',
			name: 'taskManager.tasks.unzipper.name',
			description: 'taskManager.tasks.unzipper.description',
		}
	) {
		this.task = taskManager.create(taskDetails)
	}

	abstract unzip(data: T): Promise<void>
}
