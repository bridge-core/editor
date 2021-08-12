import { ITaskDetails, Task } from './Task'
import { reactive } from '@vue/composition-api'

export const tasks: Task[] = reactive([])

export class TaskManager {
	create(taskDetails: ITaskDetails) {
		const task = new Task(this, taskDetails)
		tasks.push(task)
		return task
	}
	delete(task: Task) {
		tasks.splice(tasks.indexOf(task), 1)
	}

	get hasRunningTasks() {
		return tasks.length > 0
	}
}
