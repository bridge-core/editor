import { BedrockProject } from '@/libs/project/BedrockProject'
import { Data } from '../Data'

interface Key {
	formats: string[]
	inject: {
		name: string
		fileType: string
		cacheKey: string
	}[]
}

export class LangData {
	private data: any

	constructor(public project: BedrockProject) {}

	public async setup() {
		this.data = await Data.get('packages/minecraftBedrock/language/lang/main.json')
	}

	public async getKeys() {
		let keys: string[] = []

		for (const key of this.data.keys as Key[]) {
			keys = keys.concat(await this.generateKeys(key))
		}

		return keys
	}

	private async generateKeys(key: Key) {
		let keys: string[] = []

		for (const fromCache of key.inject) {
			const fetchedData =
				(await this.project.indexerService.getCachedData(fromCache.fileType, undefined, fromCache.cacheKey)) ??
				[]

			for (const format of key.formats) {
				keys = keys.concat(fetchedData.map((data: string) => format.replace(`{{${fromCache.name}}}`, data)))
			}
		}

		return keys
	}
}
