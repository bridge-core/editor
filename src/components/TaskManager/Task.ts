import { InformationWindow } from '../Windows/Common/Information/InformationWindow'
import type { TaskManager } from './TaskManager'

export interface ITaskDetails {
	icon: string
	name: string
	description: string
	totalTaskSteps?: number
}

export class Task {
	public currentStepCount: number = 0
	protected window: any
	constructor(
		protected taskManager: TaskManager,
		protected taskDetails: ITaskDetails
	) {}

	update(newStepCount?: number, newTotalSteps?: number) {
		if (newStepCount !== undefined) this.currentStepCount = newStepCount
		if (newTotalSteps !== undefined)
			this.taskDetails.totalTaskSteps = newTotalSteps
	}

	createWindow() {
		this.window = new InformationWindow({
			name: this.name,
			description: this.description,
		})
	}

	complete() {
		if (this.window) this.window.dispose()
		this.dispose()
	}

	protected dispose() {
		this.taskManager?.delete(this)
	}

	get name() {
		return this.taskDetails.name
	}
	get description() {
		return this.taskDetails.description
	}
	get totalStepCount() {
		return this.taskDetails.totalTaskSteps ?? 100
	}
	get icon() {
		return this.taskDetails.icon
	}
	get progress() {
		return Math.round((this.currentStepCount / this.totalStepCount) * 100)
	}
}
