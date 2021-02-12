import { App } from '@/App'
import { BaseWindow } from '@/components/Windows/BaseWindow'
import CreateProjectComponent from './CreateProject.vue'

export class CreateProjectWindow extends BaseWindow {
	protected isFirstProject = false
	protected projectName: string = ''
	protected projectDescription: string = ''
	protected projectPrefix: string = 'bridge'
	protected projectAuthor: string = ''
	protected projectTargetVersion: string = ''
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
			// Set default version
			this.projectTargetVersion = this.availableTargetVersions[
				this.availableTargetVersions.length - 1
			]
			this.availableTargetVersionsLoading = false
		})
	}

	get hasRequiredData() {
		return (
			this.projectName.length > 0 &&
			this.projectPrefix.length > 0 &&
			this.projectAuthor.length > 0 &&
			this.projectTargetVersion.length > 0
		)
	}

	open(isFirstProject = false) {
		this.isFirstProject = isFirstProject
		super.open()
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
