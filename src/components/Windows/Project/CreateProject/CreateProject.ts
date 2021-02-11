import { App } from '@/App'
import { BaseWindow } from '@/components/Windows/BaseWindow'
import CreateProjectComponent from './CreateProject.vue'

export class CreateProjectWindow extends BaseWindow {
	protected projectName: string = ''
	protected projectPrefix: string = 'bridge'
	protected projectAuthor: string = ''
	protected projectTargetVersion: string = '1.16.100'
	protected projectIcon: File | null = null
	protected isCreatingProject = false
	protected availableTargetVersions: string[] = []
	protected availableTargetVersionsLoading = true

	constructor() {
		super(CreateProjectComponent, false)
		this.defineWindow()

		App.ready.once(async app => {
			this.availableTargetVersions = await app.fileSystem.readJSON(
				'data/packages/formatVersions.json'
			)
			this.availableTargetVersionsLoading = false
		})
	}

	get hasRequiredData() {
		return (
			this.projectName.length > 0 &&
			this.projectPrefix.length > 0 &&
			this.projectAuthor.length > 0
		)
	}

	createProject() {
		return new Promise<void>(resolve =>
			App.ready.once(async app => {
				const fs = app.fileSystem

				await fs.mkdir(`projects/${this.projectName}`, {
					recursive: true,
				})

				await Promise.all([
					fs.mkdir(`projects/${this.projectName}/bridge`, {
						recursive: true,
					}),
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

				await fs.writeJSON(
					`projects/${this.projectName}/bridge/config.json`,
					{
						projectPrefix: this.projectPrefix,
						projectAuthor: this.projectAuthor,
						projectTargetVersion: this.projectTargetVersion,
					}
				)

				if (this.projectIcon)
					await fs.writeFile(
						`projects/${this.projectName}/bridge/packIcon.png`,
						this.projectIcon
					)

				await app.projectManager.addProject(this.projectName)
				resolve()
			})
		)
	}
}
