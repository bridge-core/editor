import { data, fileSystem, projectManager } from '@/App'
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

	public getDefaultPresetOptions(presetPath: string) {
		const preset = this.presets[presetPath]

		const options: any = {}

		for (const [key, value] of Object.entries(preset.additionalModels)) {
			options[key] = value
		}

		return options
	}

	public async createPreset(presetPath: string, presetOptions: any) {
		const project = projectManager.currentProject

		if (!project) return

		const preset = this.presets[presetPath]

		const createFiles = preset.createFiles ?? []

		for (let [templatePath, targetPath, templateOptions] of createFiles) {
			templatePath = join(
				dirname(presetPath.substring('file:///data/'.length)),
				templatePath
			)

			let templateContent = await data.getText(templatePath)

			if (templateOptions.inject) {
				for (const inject of templateOptions.inject) {
					targetPath = targetPath.replace(
						'{{' + inject + '}}',
						presetOptions[inject]
					)
				}
			}

			targetPath = join(
				project.packs[templateOptions.packPath],
				targetPath
			)

			await fileSystem.ensureDirectory(targetPath)

			await fileSystem.writeFile(targetPath, templateContent)
		}
	}
}
