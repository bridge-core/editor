import { Ref, ShallowRef, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { get, set } from 'idb-keyval'
import { Event } from '@/libs/event/Event'
import { Disposable } from '@/libs/disposeable/Disposeable'

interface Setting<T> {
	default: T
	load?: (value: any) => Promise<T>
	save?: (value: T) => Promise<any>
}

/**
 * @description The settings for bridge.
 */
export class Settings {
	/**
	 * @description A list of registered settings.
	 */
	public static settings: Record<string, any> = {}
	/**
	 * @description TODO
	 */
	public static updated: Event<{ id: string; value: any }> = new Event()
	/**
	 * @description TODO
	 */
	public static definitions: Record<string, Setting<any>> = {}

	/**
	 * @description TODO
	 */
	public static loadedSettings: Record<string, any> = {}

	/**
	 * @description Loads the settings.
	 */
	public static async load() {
		try {
			Settings.loadedSettings = JSON.parse((await get('settings')) as string)
		} catch {}

		for (const id of Object.keys(Settings.definitions)) {
			await Settings.updateSetting(id)
		}

		for (const [id, value] of Object.entries(Settings.settings)) {
			Settings.updated.dispatch({ id, value })
		}
	}

	/**
	 * @description Adds and registers a new setting.
	 * @param id The id of the setting.
	 * @param setting The configurations of the setting.
	 */
	public static async addSetting(id: string, setting: Setting<any>) {
		Settings.definitions[id] = setting

		await this.updateSetting(id)
	}

	/**
	 * @description TODO
	 * @param id
	 */
	public static removeDefinition(id: string) {
		delete Settings.definitions[id]

		if (Settings.settings[id] !== undefined) delete Settings.settings[id]
	}

	/**
	 * @description Gets a value from the settings.
	 * @param id The id of the setting.
	 * @returns The value of the setting.
	 */
	public static get<T>(id: string): T {
		return Settings.settings[id]
	}

	/**
	 * @description Sets a settings value.
	 * @param id The id of the setting.
	 * @param value The value to set for the setting.
	 */
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

		await set('settings', JSON.stringify(saveSettings))

		Settings.updated.dispatch({ id, value })
	}

	/**
	 * @description Updates a setting.
	 * @param id The id of the setting to update.
	 */
	private static async updateSetting(id: string) {
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

	/**
	 * @description TODO
	 * @returns
	 */
	public static useGet(): Ref<(id: string) => any> {
		const get: Ref<(id: string) => any> = ref(Settings.get)

		function updateSettings() {
			//@ts-ignore this value in't acutally read by any code, it just triggers an update
			get.value = null
			get.value = Settings.get
		}

		let disposable: Disposable

		onMounted(() => {
			disposable = Settings.updated.on(updateSettings)
		})

		onUnmounted(() => {
			disposable.dispose()
		})

		return get
	}
}

/**
 * @description TODO
 * @returns
 */
export function useSettings(): Ref<Settings> {
	const currentSettings: ShallowRef<Settings> = shallowRef(Settings)

	function updateSettings() {
		//@ts-ignore this value in't acutally read by any code, it just triggers an update
		currentSettings.value = null
		currentSettings.value = Settings
	}

	let disposable: Disposable

	onMounted(() => {
		disposable = Settings.updated.on(updateSettings)
	})

	onUnmounted(() => {
		disposable.dispose()
	})

	return currentSettings
}
