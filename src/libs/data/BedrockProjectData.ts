import { IPackType } from 'mc-project-core'
import { ProjectData } from './ProjectData'
import { addSchemas } from '@/libs/monaco/Json'

export class BedrockProjectData extends ProjectData {
	public packDefinitions: IPackType[] = []

	public async load() {
		this.packDefinitions = await this.data.get(
			'packages/minecraftBedrock/packDefinitions.json'
		)

		const commonSchemas = Object.entries(
			await this.data.get('packages/common/schemas.json')
		).map(([uri, schema]: [string, any]) => {
			return {
				uri,
				schema,
			}
		})

		addSchemas(commonSchemas)
	}
}
