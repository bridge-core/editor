import { DashService } from '@/libs/compiler/DashService'
import { Project } from './Project'
import { fileSystem } from '@/App'
import { join } from '@/libs/path'
import { BaseFileSystem } from '../fileSystem/BaseFileSystem'
import { BedrockProjectData } from '../data/bedrock/BedrockProjectData'

export class BedrockProject extends Project {
	public dashService = new DashService(this)
	public config: any

	public declare data: BedrockProjectData

	public async load() {
		await super.load()

		this.config = JSON.parse(
			await fileSystem.readFileText(join(this.path, 'config.json'))
		)

		await this.dashService.load()

		this.dashService.build()
	}

	public async dispose() {
		await this.dashService.dispose()
	}

	public async setNewOutputFileSystem(fileSystem: BaseFileSystem) {
		await super.setNewOutputFileSystem(fileSystem)

		this.dashService.setNewOutputFileSystem(fileSystem)
		this.dashService.build()
	}

	public async build() {
		await this.dashService.build()
	}
}
