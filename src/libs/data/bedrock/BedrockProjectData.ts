import { IPackType } from 'mc-project-core'
import { ProjectData } from '../ProjectData'
import { FileTypeData } from '../FileTypeData'
import { BedrockSchemaData } from './BedrockSchemaData'

export class BedrockProjectData extends ProjectData {
	public packDefinitions: IPackType[] = []
	public fileTypeData = new FileTypeData()
	public schemaData = new BedrockSchemaData()

	public async load() {
		this.packDefinitions = await this.data.get(
			'packages/minecraftBedrock/packDefinitions.json'
		)

		await this.fileTypeData.load(this.data)
		await this.schemaData.load(this.data)
	}
}