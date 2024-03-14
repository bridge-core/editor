import { Windows } from '@/components/Windows/Windows'
import { ComputedRef, Ref, computed, ref } from 'vue'
import ColorScheme from './Appearance/ColorScheme.vue'
import { ThemeManager } from '@/libs/theme/ThemeManager'
import { LocaleManager } from '@/libs/locales/Locales'
import OutputFolder from './Projects/OutputFolder.vue'

interface Category {
	label: string
	icon: string
}

interface Item {
	type: string
}

export interface CustomItem extends Item {
	type: 'custom'
	component: any
}

export interface DropdownItem extends Item {
	type: 'dropdown'
	label: string
	values: ComputedRef<string[]>
	labels: ComputedRef<string[]>
}

export interface ToggleItem extends Item {
	type: 'toggle'
	label: string
}

export class SettingsWindow {
	public static categories: Record<string, Category> = {}
	public static items: Record<string, Record<string, Item>> = {}

	public static selectedCategory: Ref<string | null> = ref('projects')

	public static setup() {
		setupProjectsCategory()
		setupGeneralCategory()
		setupActionsCategory()
		setupAppearanceCategory()
		setupEditorCategory()
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

function setupProjectsCategory() {
	SettingsWindow.addCategory('projects', {
		label: 'windows.settings.projects.name',
		icon: 'folder',
	})

	SettingsWindow.addItem('projects', 'outputFolder', <CustomItem>{
		type: 'custom',
		component: OutputFolder,
	})
}

function setupGeneralCategory() {
	SettingsWindow.addCategory('general', {
		label: 'windows.settings.general.name',
		icon: 'circle',
	})

	SettingsWindow.addItem('general', 'language', <DropdownItem>{
		type: 'dropdown',
		label: 'windows.settings.general.language.name',
		values: computed(() => LocaleManager.getAvailableLanguages().map((language) => language.text)),
		labels: computed(() => LocaleManager.getAvailableLanguages().map((language) => language.text)),
	})
}

function setupActionsCategory() {
	SettingsWindow.addCategory('actions', {
		label: 'windows.settings.actions.name',
		icon: 'keyboard',
	})
}

function setupAppearanceCategory() {
	SettingsWindow.addCategory('appearance', {
		label: 'windows.settings.appearance.name',
		icon: 'palette',
	})

	SettingsWindow.addItem('appearance', 'colorScheme', <CustomItem>{
		type: 'custom',
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

function setupEditorCategory() {
	SettingsWindow.addCategory('editor', {
		label: 'windows.settings.editor.name',
		icon: 'edit',
	})

	SettingsWindow.addItem('editor', 'bracketPairColorization', <ToggleItem>{
		type: 'toggle',
		label: 'windows.settings.editor.bracketPairColorization.name',
	})
}
