import { App } from '@/App'
import { selectProject } from '@/components/Project/Loader'
import { BaseWindow } from '@/components/Windows/BaseWindow'
import CreateProjectComponent from './CreateProject.vue'

export class CreateProjectWindow extends BaseWindow {
	protected projectName: string | null = null
	protected projectIcon: File | null = null
	protected isCreatingProject = false

	constructor() {
		super(CreateProjectComponent, false)
		this.defineWindow()
	}

	get hasRequiredData() {
		return this.projectName !== undefined
	}

	createProject() {
		return new Promise<void>(resolve =>
			App.ready.once(async app => {
				const fs = app.fileSystem

				await fs.mkdir(`projects/${this.projectName}`, {
					recursive: true,
				})

				await Promise.all([
					fs.mkdir(`projects/${this.projectName}/BP`, {
						recursive: true,
					}),
					fs.mkdir(`projects/${this.projectName}/RP`, {
						recursive: true,
					}),
					fs.mkdir(`projects/${this.projectName}/SP`, {
						recursive: true,
					}),
				])

				if (this.projectIcon)
					await fs.writeFile(
						`projects/${this.projectName}/bridge/packIcon.png`,
						this.projectIcon
					)

				selectProject(this.projectName!)
				resolve()
			})
		)
	}
}
