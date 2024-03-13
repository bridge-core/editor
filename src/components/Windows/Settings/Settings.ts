import { Ref, ShallowRef, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { ActionsCategory } from './Categories/Actions'
import { AppearanceCategory } from './Categories/Appearance/Appearance'
import { Category } from './Categories/Category'
import { EditorCategory } from './Categories/Editor'
import { GeneralCategory } from './Categories/General'
import { ProjectsCategory } from './Categories/Projects'
import { EventSystem } from '@/libs/event/EventSystem'
import { settings } from '@/App'
import { Windows } from '@/components/Windows/Windows'
import { get, set } from 'idb-keyval'

export class Settings {
	public categories: Category[] = []
	public settings: any = null
	public eventSystem = new EventSystem(['updated'])
	public selectedCategory: Ref<Category | null> = ref(null)

	constructor() {
		this.addCategory(new GeneralCategory())
		this.addCategory(new EditorCategory())
		this.addCategory(new AppearanceCategory())
		this.addCategory(new ProjectsCategory())
		this.addCategory(new ActionsCategory())

		this.selectedCategory.value = this.categories[0]
	}

	public async load() {
		try {
			this.settings = JSON.parse((await get('settings')) as string)
		} catch {}

		if (this.settings === null) {
			this.settings = {}

			for (const category of this.categories) {
				this.settings = {
					...this.settings,
					...category.getDefaults(),
				}
			}

			for (const category of this.categories) {
				for (const setting of category.settings) {
					if (setting.update) await setting.update(this.settings[setting.id], true)

					this.eventSystem.dispatch('updated', { id: setting.id, value: this.settings[setting.id] })
				}
			}

			return
		}

		for (const category of this.categories) {
			for (const setting of category.settings) {
				if (setting.load) {
					this.settings[setting.id] = await setting.load()
				} else if (!this.settings[setting.id]) {
					this.settings[setting.id] = setting.defaultValue
				}

				if (setting.update) await setting.update(this.settings[setting.id], true)

				this.eventSystem.dispatch('updated', { id: setting.id, value: this.settings[setting.id] })
			}
		}
	}

	public addCategory(category: Category) {
		this.categories.push(category)
	}

	public get(id: string): any {
		return this.settings[id]
	}

	public async set(id: string, value: any) {
		if (!this.settings) return

		this.settings[id] = value

		for (const category of this.categories) {
			const setting = category.settings.find((setting) => setting.id === id)
			if (!setting) continue

			if (setting.update) await setting.update(value, false)

			if (setting.save) {
				await setting.save(value)
			} else {
				set('settings', JSON.stringify(this.settings))
			}

			this.eventSystem.dispatch('updated', { id, value })
		}
	}

	public open(categoryId?: string) {
		Windows.open('settings')

		if (!categoryId) return

		const category = this.categories.find((category) => category.id === categoryId)

		if (!category) return

		this.selectedCategory.value = category
	}
}

export function useSettings(): Ref<Settings> {
	const currentSettings: ShallowRef<Settings> = shallowRef(settings)

	function updateSettings() {
		//@ts-ignore this value in't acutally read by any code, it just triggers an update
		currentSettings.value = null
		currentSettings.value = settings
	}

	onMounted(() => {
		settings.eventSystem.on('updated', updateSettings)
	})

	onUnmounted(() => {
		settings.eventSystem.off('updated', updateSettings)
	})

	return currentSettings
}
