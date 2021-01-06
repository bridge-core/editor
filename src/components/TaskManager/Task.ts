import type { TaskManager } from "./TaskManager"

export interface ITaskDetails {
	icon: string
	name: string
	description: string
	totalTaskSteps: number
}

export class Task {
	public currentStepCount: number = 0
	constructor(protected taskManager: TaskManager, protected taskDetails: ITaskDetails) {}

	update(newStepCount: number, newTotalSteps?: number) {
		this.currentStepCount = newStepCount
		if (newTotalSteps) this.taskDetails.totalTaskSteps = newTotalSteps
	}

    complete() {
        this.dispose()
    }

    dispose() {
        this.taskManager.delete(this)
    }

    get name() {
        return this.taskDetails.name
    }
    get description() {
        return this.taskDetails.description
    }
    get totalStepCount() {
        return this.taskDetails.totalTaskSteps
    }
    get icon() {
        return this.taskDetails.icon
    }
}
