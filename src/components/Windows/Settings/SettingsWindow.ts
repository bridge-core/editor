import { Windows } from '@/components/Windows/Windows'
import { ComputedRef, Ref, computed, ref } from 'vue'
import ColorScheme from './Appearance/ColorScheme.vue'
import { ThemeManager } from '@/libs/theme/ThemeManager'

interface Category {
	label: string
	icon: string
}

interface Item {
	label: string
	type: string
}

export interface CustomItem extends Item {
	type: 'custom'
	component: any
}

export interface DropdownItem extends Item {
	type: 'dropdown'
	values: ComputedRef<string[]>
	labels: ComputedRef<string[]>
}

export class SettingsWindow {
	public static categories: Record<string, Category> = {}
	public static items: Record<string, Record<string, Item>> = {}

	public static selectedCategory: Ref<string | null> = ref('appearance')

	public static setup() {
		// SettingsWindow.addCategory('projects', {
		// 	label: 'windows.settings.projects.name',
		// 	icon: 'folder',
		// })
		// SettingsWindow.addCategory('general', {
		// 	label: 'windows.settings.general.name',
		// 	icon: 'circle',
		// })
		// SettingsWindow.addCategory('editor', {
		// 	label: 'windows.settings.editor.name',
		// 	icon: 'edit',
		// })
		// SettingsWindow.addCategory('actions', {
		// 	label: 'windows.settings.actions.name',
		// 	icon: 'keyboard',
		// })
		// SettingsWindow.addCategory('appearance', {
		// 	label: 'windows.settings.appearance.name',
		// 	icon: 'palette',
		// })

		setupAppearanceCategory()
	}

	public static openSettings(categoryId?: string) {
		Windows.open('settings')

		if (!categoryId) return

		SettingsWindow.selectedCategory.value = categoryId
	}

	public static addCategory(id: string, category: Category) {
		SettingsWindow.categories[id] = category

		SettingsWindow.items[id] = {}
	}

	public static addItem<T extends Item>(categroy: string, id: string, item: T) {
		SettingsWindow.items[categroy][id] = item
	}
}

function setupAppearanceCategory() {
	SettingsWindow.addCategory('appearance', {
		label: 'windows.settings.appearance.name',
		icon: 'palette',
	})

	SettingsWindow.addItem('appearance', 'colorScheme', <CustomItem>{
		type: 'custom',
		label: 'windows.settings.appearance.colorScheme.name',
		component: ColorScheme,
	})

	const themes = ThemeManager.useThemesImmediate()
	const darkThemes = computed(() => themes.value.filter((theme) => theme.colorScheme === 'dark'))
	const lightThemes = computed(() => themes.value.filter((theme) => theme.colorScheme === 'light'))

	SettingsWindow.addItem('appearance', 'darkTheme', <DropdownItem>{
		type: 'dropdown',
		label: 'windows.settings.appearance.darkTheme.name',
		values: computed(() => darkThemes.value.map((theme) => theme.id)),
		labels: computed(() => darkThemes.value.map((theme) => theme.name)),
	})

	SettingsWindow.addItem('appearance', 'lightTheme', <DropdownItem>{
		type: 'dropdown',
		label: 'windows.settings.appearance.lightTheme.name',
		values: computed(() => lightThemes.value.map((theme) => theme.id)),
		labels: computed(() => lightThemes.value.map((theme) => theme.name)),
	})
}
