import { data } from '@/App'

export class PresetData {
	public presets: { [key: string]: any } = {}
	public categories: { [key: string]: string[] } = {}

	public async load() {
		this.presets = await data.get('packages/minecraftBedrock/presets.json')

		for (const [presetPath, preset] of Object.entries(this.presets)) {
			if (!this.categories[preset.category])
				this.categories[preset.category] = []

			this.categories[preset.category].push(presetPath)
		}
	}

	public async createPreset(path: string, options: any) {
		console.log(
			'Creating preset',
			path,
			JSON.parse(JSON.stringify(options))
		)
	}
}
