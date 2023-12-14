import { data } from '@/App'
import { dirname, join } from '@/libs/path'

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

	public async createPreset(presetPath: string, presetOptions: any) {
		const preset = this.presets[presetPath]

		console.log(preset)

		const createFiles = preset.createFiles ?? []

		for (let [templatePath, targetPath, templateOptions] of createFiles) {
			templatePath = join(
				dirname(presetPath.substring('file:///data/'.length)),
				templatePath
			)

			let templateContent = await data.get(templatePath)

			if (templateOptions.inject) {
				for (const inject of templateOptions.inject) {
					targetPath = targetPath.replace(
						inject,
						`{{${presetOptions[inject]}}}`
					)
				}
			}

			console.log(targetPath)
		}
	}
}
