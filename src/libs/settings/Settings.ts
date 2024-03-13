import { Ref, ShallowRef, onMounted, onUnmounted, shallowRef } from 'vue'
import { EventSystem } from '@/libs/event/EventSystem'
import { get, set } from 'idb-keyval'

interface SettingDefinition<T> {
	default: T
	label: string
	description: string | undefined
	category: string
	load?: (value: any) => Promise<T>
	save?: (value: T) => Promise<any>
}

export class Settings {
	public static settings: Record<string, any> = {}
	public static eventSystem = new EventSystem(['updated'])
	public static definitions: Record<string, SettingDefinition<any>> = {}

	public static loadedSettings: Record<string, any> = {}

	public static async load() {
		try {
			Settings.loadedSettings = JSON.parse((await get('settings')) as string)
		} catch {}

		for (const id of Object.keys(Settings.definitions)) {
			await Settings.updateDefinition(id)
		}

		for (const [id, value] of Object.entries(Settings.settings)) {
			Settings.eventSystem.dispatch('updated', { id, value })
		}
	}

	public static async addDefinition(id: string, definition: SettingDefinition<any>) {
		Settings.definitions[id] = definition

		await this.updateDefinition(id)
	}

	public static removeDefinition(id: string) {
		delete Settings.definitions[id]

		if (Settings.settings[id] !== undefined) delete Settings.settings[id]
	}

	public static get(id: string): any {
		return Settings.settings[id]
	}

	public static async set(id: string, value: any) {
		Settings.settings[id] = value

		const saveSettings: Record<string, any> = {}

		for (const id of Object.keys(Settings.definitions)) {
			const definition = Settings.definitions[id]

			if (!definition) return

			if (definition.save) {
				saveSettings[id] = await definition.save(Settings.settings[id])

				continue
			}

			saveSettings[id] = Settings.settings[id]
		}

		await set('settings', JSON.stringify(this.settings))

		Settings.eventSystem.dispatch('updated', { id, value })
	}

	private static async updateDefinition(id: string) {
		const definition = Settings.definitions[id]

		if (Settings.settings[id] === undefined) Settings.settings[id] = definition.default

		if (definition.load) {
			Settings.settings[id] = await definition.load(Settings.loadedSettings[id])

			return
		}

		Settings.settings[id] = Settings.loadedSettings[id]
	}
}

export function useSettings(): Ref<Settings> {
	const currentSettings: ShallowRef<Settings> = shallowRef(Settings)

	function updateSettings() {
		//@ts-ignore this value in't acutally read by any code, it just triggers an update
		currentSettings.value = null
		currentSettings.value = Settings
	}

	onMounted(() => {
		Settings.eventSystem.on('updated', updateSettings)
	})

	onUnmounted(() => {
		Settings.eventSystem.off('updated', updateSettings)
	})

	return currentSettings
}
