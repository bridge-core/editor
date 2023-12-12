import { DashService } from '@/libs/compiler/DashService'
import { Project } from './Project'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { IConfigJson, IPackType } from 'mc-project-core'
import { FileTypeData } from '@/libs/data/bedrock/FileTypeData'
import { data } from '@/App'
import { BedrockSchemaData } from '@/libs/data/bedrock/BedrockSchemaData'

export class BedrockProject extends Project {
	public declare config: IConfigJson | null

	public packDefinitions: IPackType[] = []
	public presets: { [key: string]: any } = {}
	public fileTypeData = new FileTypeData()
	public schemaData = new BedrockSchemaData()

	public dashService = new DashService(this)

	public async load() {
		await super.load()

		this.packDefinitions = await data.get(
			'packages/minecraftBedrock/packDefinitions.json'
		)

		this.presets = await data.get('packages/minecraftBedrock/presets.json')

		await this.fileTypeData.load()
		await this.schemaData.load()

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
