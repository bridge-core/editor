import { projectManager, windows } from '@/App'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { Ref, ref } from 'vue'

export class PresetsWindow {
	public presets: Ref<{ [key: string]: any[] }> = ref({})

	public async open() {
		if (!(projectManager.currentProject instanceof BedrockProject)) return

		for (const [presetPath, preset] of Object.entries(
			projectManager.currentProject.data.presets
		)) {
			if (!this.presets.value[preset.category]) {
				this.presets.value[preset.category] = [preset]
			} else {
				this.presets.value[preset.category].push(preset)
			}
		}

		this.presets.value = { ...this.presets.value }

		console.log(this.presets.value)

		windows.open('presets')
	}
}
