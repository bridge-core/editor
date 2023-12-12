import { projectManager, windows } from '@/App'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { Ref, ref } from 'vue'

export class PresetsWindow {
	public categorizedPresets: Ref<{ [key: string]: { [key: string]: any } }> =
		ref({})

	public async open() {
		if (!(projectManager.currentProject instanceof BedrockProject)) return

		for (const [presetPath, preset] of Object.entries(
			projectManager.currentProject.data.presets
		)) {
			if (!this.categorizedPresets.value[preset.category])
				this.categorizedPresets.value[preset.category] = {}

			this.categorizedPresets.value[preset.category][presetPath] = preset
		}

		this.categorizedPresets.value = { ...this.categorizedPresets.value }

		windows.open('presets')
	}

	public async createPreset(path: string, options: any) {
		console.log(
			'Creating preset',
			path,
			JSON.parse(JSON.stringify(options))
		)
	}
}
