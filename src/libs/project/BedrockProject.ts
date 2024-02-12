import { DashService } from '@/libs/compiler/DashService'
import { Project } from './Project'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { IPackType } from 'mc-project-core'
import { FileTypeData } from '@/libs/data/bedrock/FileTypeData'
import { data } from '@/App'
import { SchemaData } from '@/libs/data/bedrock/SchemaData'
import { PresetData } from '@/libs/data/bedrock/PresetData'
import { ScriptTypeData } from '@/libs/data/bedrock/ScriptTypeData'
import { IndexerService } from '@/libs/indexer/bedrock/IndexerService'
import { RequirementsMatcher } from '../data/bedrock/RequirementsMatcher'

export class BedrockProject extends Project {
	public packDefinitions: IPackType[] = []
	public fileTypeData = new FileTypeData()
	public schemaData = new SchemaData()
	public presetData = new PresetData()
	public scriptTypeData = new ScriptTypeData(this)
	public indexerService = new IndexerService(this)
	public dashService = new DashService(this)
	public requirementsMatcher = new RequirementsMatcher(this)

	public async load() {
		await super.load()

		this.packDefinitions = await data.get('packages/minecraftBedrock/packDefinitions.json')

		await this.fileTypeData.load()

		await this.indexerService.setup()

		await this.schemaData.load()

		await this.presetData.load()

		await this.scriptTypeData.load()

		await this.dashService.setup()

		await this.requirementsMatcher.setup()

		this.dashService.build()
	}

	public async dispose() {
		await super.dispose()

		await this.dashService.dispose()
	}

	public async setOutputFileSystem(fileSystem: BaseFileSystem) {
		await super.setOutputFileSystem(fileSystem)

		await this.dashService.setOutputFileSystem(fileSystem)

		if (!this.dashService.isSetup) return

		this.dashService.build()
	}

	public async build() {
		await this.dashService.build()
	}
}
