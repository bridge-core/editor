import { setSchemas } from '@/libs/monaco/Json'
import { Data } from '../Data'

export class BedrockSchemaData {
	public schemas: any

	public async load(data: Data) {
		this.schemas = {
			...(await data.get('packages/common/schemas.json')),
			...(await data.get('packages/minecraftBedrock/schemas.json')),
		}

		setSchemas(
			Object.keys(this.schemas).map((schema) => ({
				uri: schema,
				schema: this.schemas[schema],
			}))
		)
	}

	public get(path: string): any | null {
		return this.schemas[path] ?? null
	}

	public applySchema(path: string, schemaUri: string) {
		setSchemas(
			Object.keys(this.schemas).map((schema) => ({
				uri: schema,
				fileMatch: schema === schemaUri ? [path] : undefined,
				schema: this.schemas[schema],
			}))
		)
	}

	public releaseSchema() {
		setSchemas(
			Object.keys(this.schemas).map((schema) => ({
				uri: schema,
				schema: this.schemas[schema],
			}))
		)
	}
}
