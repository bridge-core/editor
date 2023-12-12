import { DashService } from '@/libs/compiler/DashService'
import { Project } from './Project'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { IConfigJson, IPackType } from 'mc-project-core'
import { FileTypeData } from '@/libs/data/bedrock/FileTypeData'
import { data } from '@/App'
import { SchemaData } from '@/libs/data/bedrock/SchemaData'
import { PresetData } from '@/libs/data/bedrock/PresetData'

export class BedrockProject extends Project {
	public declare config: IConfigJson | null

	public packDefinitions: IPackType[] = []
	public fileTypeData = new FileTypeData()
	public schemaData = new SchemaData()
	public presetData = new PresetData()

	public dashService = new DashService(this)

	public async load() {
		await super.load()

		this.packDefinitions = await data.get(
			'packages/minecraftBedrock/packDefinitions.json'
		)

		await this.fileTypeData.load()
		await this.schemaData.load()
		await this.presetData.load()

		await this.dashService.load()

		this.dashService.build()
	}

	public async dispose() {
		await this.dashService.dispose()
	}

	public async setOutputFileSystem(fileSystem: BaseFileSystem) {
		await super.setOutputFileSystem(fileSystem)

		await this.dashService.setOutputFileSystem(fileSystem)

		this.dashService.build()
	}

	public async build() {
		await this.dashService.build()
	}
}
