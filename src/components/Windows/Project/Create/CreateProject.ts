import { BaseWindow } from '@/components/Windows/BaseWindow'
import CreateProjectComponent from './CreateProject.vue'

export class CreateProjectWindow extends BaseWindow {
	protected projectName: string | null = null
	protected projectIcon: File | null = null

	constructor() {
		super(CreateProjectComponent, false)
		this.defineWindow()
	}

	get hasRequiredData() {
		return this.projectName !== undefined
	}
}
