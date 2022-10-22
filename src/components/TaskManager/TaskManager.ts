import { ITaskDetails, Task } from './Task'
import { ref } from 'vue'

export const tasks = ref<Task[]>([])

export class TaskManager {
	create(taskDetails: ITaskDetails) {
		const task = new Task(this, taskDetails)
		tasks.value.push(task)
		return task
	}
	delete(task: Task) {
		tasks.value = tasks.value.filter((t) => t !== task)
	}

	get hasRunningTasks() {
		return tasks.value.length > 0
	}
}
