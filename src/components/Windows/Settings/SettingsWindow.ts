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

type Item = CustomItem | DropdownItem | AutocompleteItem | ToggleItem

export interface CustomItem {
	type: 'custom'
	component: any
}

export interface DropdownItem {
	type: 'dropdown'
	label: string
	values: ComputedRef<string[]>
	labels: ComputedRef<string[]>
}

export interface AutocompleteItem {
	type: 'autocomplete'
	label: string
	completions: ComputedRef<CompletionItem[]>
}

export interface ToggleItem {
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

	SettingsWindow.addItem('projects', 'outputFolder', {
		type: 'custom',
		component: OutputFolder,
	})
}

function setupGeneralCategory() {
	SettingsWindow.addCategory('general', {
		label: 'windows.settings.general.name',
		icon: 'circle',
	})

	SettingsWindow.addItem('general', 'language', {
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

	SettingsWindow.addItem('actions', 'actionsList', {
		type: 'custom',
		component: ActionsList,
	})
}

function setupAppearanceCategory() {
	SettingsWindow.addCategory('appearance', {
		label: 'windows.settings.appearance.name',
		icon: 'palette',
	})

	SettingsWindow.addItem('appearance', 'colorScheme', {
		type: 'custom',
		component: ColorScheme,
	})

	const themes = ThemeManager.useThemesImmediate()

	const darkThemes = computed(() => themes.value.filter((theme) => theme.colorScheme === 'dark'))
	const lightThemes = computed(() => themes.value.filter((theme) => theme.colorScheme === 'light'))

	SettingsWindow.addItem('appearance', 'darkTheme', {
		type: 'dropdown',
		label: 'windows.settings.appearance.darkTheme.name',
		values: computed(() => darkThemes.value.map((theme) => theme.id)),
		labels: computed(() => darkThemes.value.map((theme) => theme.name)),
	})

	SettingsWindow.addItem('appearance', 'lightTheme', {
		type: 'dropdown',
		label: 'windows.settings.appearance.lightTheme.name',
		values: computed(() => lightThemes.value.map((theme) => theme.id)),
		labels: computed(() => lightThemes.value.map((theme) => theme.name)),
	})

	SettingsWindow.addItem('appearance', 'font', {
		type: 'dropdown',
		label: 'windows.settings.appearance.font.name',
		values: computed(() => [
			'Inter',
			'Roboto',
			'Arial',
			'Verdana',
			'Helvetica',
			'Tahome',
			'Trebuchet MS',
			'Menlo',
			'Monaco',
			'Courier New',
			'monospace',
		]),
		labels: computed(() => [
			'Inter',
			'Roboto',
			'Arial',
			'Verdana',
			'Helvetica',
			'Tahome',
			'Trebuchet MS',
			'Menlo',
			'Monaco',
			'Courier New',
			'Monospace',
		]),
	})

	SettingsWindow.addItem('appearance', 'editorFont', {
		type: 'dropdown',
		label: 'windows.settings.appearance.editorFont.name',
		values: computed(() => ['Roboto', 'Arial', 'Consolas', 'Menlo', 'Monaco', '"Courier New"', 'monospace']),
		labels: computed(() => ['Roboto', 'Arial', 'Consolas', 'Menlo', 'Monaco', '"Courier New"', 'Monospace']),
	})

	SettingsWindow.addItem('appearance', 'editorFontSize', {
		type: 'autocomplete',
		label: 'windows.settings.appearance.editorFontSize.name',
		completions: computed(() =>
			[8, 10, 12, 14, 16, 18, 20].map((value) => ({
				type: 'value',
				label: value.toString(),
				value,
			}))
		),
	})

	SettingsWindow.addItem('appearance', 'sidebarRight', {
		type: 'toggle',
		label: 'windows.settings.sidebar.sidebarRight.name',
	})
}

function setupEditorCategory() {
	SettingsWindow.addCategory('editor', {
		label: 'windows.settings.editor.name',
		icon: 'edit',
	})

	SettingsWindow.addItem('editor', 'jsonEditor', {
		type: 'dropdown',
		label: 'windows.settings.editor.jsonEditor.name',
		labels: computed(() => ['Raw Text Editor', 'Tree Editor']),
		values: computed(() => ['text', 'tree']),
	})

	SettingsWindow.addItem('editor', 'bracketPairColorization', {
		type: 'toggle',
		label: 'windows.settings.editor.bracketPairColorization.name',
	})

	SettingsWindow.addItem('editor', 'wordWrap', {
		type: 'toggle',
		label: 'windows.settings.editor.wordWrap.name',
	})

	SettingsWindow.addItem('editor', 'wordWrapColumns', {
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

	SettingsWindow.addItem('editor', 'bridgePredictions', {
		type: 'toggle',
		label: 'windows.settings.editor.bridgePredictions.name',
	})

	SettingsWindow.addItem('editor', 'inlineDiagnostics', {
		type: 'toggle',
		label: 'windows.settings.editor.inlineTreeEditorDiagnostics.name',
	})
}

function setupDeveloperCategory() {
	SettingsWindow.addCategory('developer', {
		label: 'windows.settings.developer.name',
		icon: 'code',
	})

	SettingsWindow.addItem('developer', 'dataDeveloperMode', {
		type: 'toggle',
		label: 'windows.settings.developer.dataDeveloperMode.name',
	})
}
