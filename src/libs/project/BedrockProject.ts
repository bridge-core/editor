import { DashService } from '@/libs/compiler/DashService'
import { Project } from './Project'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { IPackType } from 'mc-project-core'
import { FileTypeData } from '@/libs/data/bedrock/FileTypeData'
import { SchemaData } from '@/libs/data/bedrock/SchemaData'
import { PresetData } from '@/libs/data/bedrock/PresetData'
import { ScriptTypeData } from '@/libs/data/bedrock/ScriptTypeData'
import { IndexerService } from '@/libs/indexer/bedrock/IndexerService'
import { RequirementsMatcher } from '@/libs/data/bedrock/RequirementsMatcher'
import { Data } from '@/libs/data/Data'
import { LangData } from '@/libs/data/bedrock/LangData'
import { CommandData } from '@/libs/data/bedrock/CommandData'
import { SnippetManager } from '@/libs/snippets/SnippetManager'

export class BedrockProject extends Project {
	public packDefinitions: IPackType[] = []
	public fileTypeData = new FileTypeData()
	public schemaData = new SchemaData(this)
	public presetData = new PresetData()
	public scriptTypeData = new ScriptTypeData(this)
	public langData = new LangData(this)
	public commandData = new CommandData(this)
	public indexerService = new IndexerService(this)
	public dashService = new DashService(this)
	public requirementsMatcher = new RequirementsMatcher(this)
	public snippetLoader = new SnippetManager()

	public async load() {
		await super.load()

		this.packDefinitions = await Data.get('packages/minecraftBedrock/packDefinitions.json')

		await this.fileTypeData.load()
		await this.indexerService.setup()
		await this.presetData.load()
		await this.scriptTypeData.setup()

		await this.langData.setup()
		await this.commandData.setup()

		await this.dashService.setup()

		await this.schemaData.load()

		await this.requirementsMatcher.setup()

		this.dashService.build()
	}

	public async dispose() {
		await super.dispose()

		this.indexerService.dispose()
		this.schemaData.dispose()
		this.presetData.dispose()

		await this.dashService.dispose()

		await this.scriptTypeData.dispose()
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
