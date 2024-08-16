import ColorScheme from './Appearance/ColorScheme.vue'
import OutputFolder from './Projects/OutputFolder.vue'
import ActionsList from './Actions/ActionsList.vue'

import { Windows } from '@/components/Windows/Windows'
import { ComputedRef, Ref, computed, ref } from 'vue'
import { ThemeManager } from '@/libs/theme/ThemeManager'
import { LocaleManager } from '@/libs/locales/Locales'
import { Window } from '../Window'
import Settings from './Settings.vue'
import { CompletionItem } from '@/libs/jsonSchema/Schema'

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

export interface AutocompleteItem extends Item {
	type: 'autocomplete'
	label: string
	completions: ComputedRef<CompletionItem[]>
}

export interface ToggleItem extends Item {
	type: 'toggle'
	label: string
}

export class SettingsWindow extends Window {
	public static id = 'settings'
	public static component = Settings

	public static categories: Record<string, Category> = {}
	public static items: Record<string, Record<string, Item>> = {}

	public static selectedCategory: Ref<string | null> = ref('projects')

	public static setup() {
		setupProjectsCategory()
		setupGeneralCategory()
		setupActionsCategory()
		setupAppearanceCategory()
		setupEditorCategory()
		setupDeveloperCategory()
	}

	public static open(categoryId?: string) {
		Windows.open(SettingsWindow)

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

	SettingsWindow.addItem('actions', 'actionsList', <CustomItem>{
		type: 'custom',
		component: ActionsList,
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

	SettingsWindow.addItem('editor', 'wordWrap', <ToggleItem>{
		type: 'toggle',
		label: 'windows.settings.editor.wordWrap.name',
	})

	SettingsWindow.addItem('editor', 'wordWrapColumns', <AutocompleteItem>{
		type: 'autocomplete',
		label: 'windows.settings.editor.wordWrapColumns.name',
		completions: computed(() =>
			[40, 60, 80, 100, 120, 160].map((value) => ({
				type: 'value',
				label: value.toString(),
				value,
			}))
		),
	})

	SettingsWindow.addItem('editor', 'bridgePredictions', <ToggleItem>{
		type: 'toggle',
		label: 'windows.settings.editor.bridgePredictions.name',
	})

	SettingsWindow.addItem('editor', 'inlineDiagnostics', <ToggleItem>{
		type: 'toggle',
		label: 'windows.settings.editor.inlineTreeEditorDiagnostics.name',
	})
}

function setupDeveloperCategory() {
	SettingsWindow.addCategory('developer', {
		label: 'windows.settings.developer.name',
		icon: 'code',
	})

	SettingsWindow.addItem('developer', 'dataDeveloperMode', <ToggleItem>{
		type: 'toggle',
		label: 'windows.settings.developer.dataDeveloperMode.name',
	})
}
