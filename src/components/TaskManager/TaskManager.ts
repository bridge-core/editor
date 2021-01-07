import { ITaskDetails, Task } from './Task'
import Vue from 'vue'
import TaskWindow from './TaskWindow.vue'
import { createWindow } from '@/components/Windows/create'

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

	showWindow() {
		const window = createWindow(TaskWindow, { tasks })
		window.open()
		return window
	}
	get hasRunningTasks() {
		return tasks.length > 0
	}
}
