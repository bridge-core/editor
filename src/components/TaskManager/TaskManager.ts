import { ITaskDetails, Task } from './Task'
import Vue from 'vue'

export const tasks: Task[] = Vue.observable([])

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
