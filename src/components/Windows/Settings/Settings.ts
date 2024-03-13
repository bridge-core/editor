import { Ref, ShallowRef, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { Category } from './Categories/Category'
import { EventSystem } from '@/libs/event/EventSystem'
import { Windows } from '@/components/Windows/Windows'
import { get, set } from 'idb-keyval'

export class Settings {
	public static categories: Category[] = []
	public static settings: any = null
	public static eventSystem = new EventSystem(['updated'])
	public static selectedCategory: Ref<Category | null> = ref(null)

	public static async load() {
		Settings.selectedCategory.value = Settings.categories[0]

		try {
			Settings.settings = JSON.parse((await get('settings')) as string)
		} catch {}

		if (Settings.settings === null) {
			Settings.settings = {}

			for (const category of Settings.categories) {
				Settings.settings = {
					...Settings.settings,
					...category.getDefaults(),
				}
			}

			for (const category of Settings.categories) {
				for (const setting of category.settings) {
					if (setting.update) await setting.update(Settings.settings[setting.id], true)

					Settings.eventSystem.dispatch('updated', { id: setting.id, value: Settings.settings[setting.id] })
				}
			}

			return
		}

		for (const category of Settings.categories) {
			for (const setting of category.settings) {
				if (setting.load) {
					Settings.settings[setting.id] = await setting.load()
				} else if (!Settings.settings[setting.id]) {
					Settings.settings[setting.id] = setting.defaultValue
				}

				if (setting.update) await setting.update(Settings.settings[setting.id], true)

				Settings.eventSystem.dispatch('updated', { id: setting.id, value: Settings.settings[setting.id] })
			}
		}
	}

	public static addCategory(category: Category) {
		Settings.categories.push(category)
	}

	public static get(id: string): any {
		return Settings.settings[id]
	}

	public static async set(id: string, value: any) {
		if (!Settings.settings) return

		Settings.settings[id] = value

		for (const category of Settings.categories) {
			const setting = category.settings.find((setting) => setting.id === id)
			if (!setting) continue

			if (setting.update) await setting.update(value, false)

			if (setting.save) {
				await setting.save(value)
			} else {
				set('settings', JSON.stringify(Settings.settings))
			}

			Settings.eventSystem.dispatch('updated', { id, value })
		}
	}

	public static open(categoryId?: string) {
		Windows.open('settings')

		if (!categoryId) return

		const category = Settings.categories.find((category) => category.id === categoryId)

		if (!category) return

		Settings.selectedCategory.value = category
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
