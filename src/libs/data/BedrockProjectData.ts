import { IPackType } from 'mc-project-core'
import { ProjectData } from './ProjectData'

export class BedrockProjectData extends ProjectData {
	public packDefinitions: IPackType[] = []

	public async load() {
		this.packDefinitions = await this.data.get(
			'packages/minecraftBedrock/packDefinitions.json'
		)
	}
}
