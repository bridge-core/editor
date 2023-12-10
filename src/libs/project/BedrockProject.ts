import { DashService } from '@/libs/compiler/DashService'
import { Project } from './Project'
import { fileSystem } from '@/App'
import { join } from '@/libs/path'

export class BedrockProject extends Project {
	public dashService = new DashService(this)
	public config: any

	public async load() {
		await super.load()

		this.config = JSON.parse(
			await fileSystem.readFileText(join(this.path, 'config.json'))
		)

		await this.dashService.load()
	}

	public async dispose() {
		await this.dashService.dispose()
	}
}
