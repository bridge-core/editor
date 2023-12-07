import { Data } from './Data'

export class SchemaData {
	private schemas: any

	public async load(data: Data) {
		this.schemas = {
			...(await data.get('packages/common/schemas.json')),
			...(await data.get('packages/minecraftBedrock/schemas.json')),
		}
	}

	public async get(path: string): Promise<any | null> {
		return this.schemas[path] ?? null
	}
}
