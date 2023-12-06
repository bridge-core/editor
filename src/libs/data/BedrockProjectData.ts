import { IPackType } from 'mc-project-core'
import { ProjectData } from './ProjectData'
import { defineSchemas } from '@/libs/monaco/Monaco'

export class BedrockProjectData extends ProjectData {
	public packDefinitions: IPackType[] = []

	public async load() {
		this.packDefinitions = await this.data.get(
			'packages/minecraftBedrock/packDefinitions.json'
		)

		const schemas = [
			{
				uri: 'internal://test-schema.json',
				fileMatch: ['*'],
				schema: {
					type: 'object',
					additionalProperties: false,
					required: ['foo', 'bar'],
					properties: {
						foo: {
							type: 'string',
						},
						bar: {
							type: 'number',
						},
					},
				},
			},
		]

		defineSchemas(schemas)
	}
}
