import { Ref, ShallowRef, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { EventSystem } from '@/libs/event/EventSystem'
import { get, set } from 'idb-keyval'

interface Setting<T> {
	default: T
	load?: (value: any) => Promise<T>
	save?: (value: T) => Promise<any>
}

export class Settings {
	public static settings: Record<string, any> = {}
	public static eventSystem = new EventSystem(['updated'])
	public static definitions: Record<string, Setting<any>> = {}

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

	public static async addDefinition(id: string, definition: Setting<any>) {
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

		if (definition.load) {
			Settings.settings[id] = await definition.load(Settings.loadedSettings[id])

			return
		}

		if (Settings.loadedSettings[id] === undefined) {
			Settings.settings[id] = definition.default

			return
		}

		Settings.settings[id] = Settings.loadedSettings[id]
	}

	public static useGet(): Ref<(id: string) => any> {
		const get: Ref<(id: string) => any> = ref(Settings.get)

		function updateSettings() {
			//@ts-ignore this value in't acutally read by any code, it just triggers an update
			get.value = null
			get.value = Settings.get
		}

		onMounted(() => {
			Settings.eventSystem.on('updated', updateSettings)
		})

		onUnmounted(() => {
			Settings.eventSystem.off('updated', updateSettings)
		})

		return get
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
