import OutputFolder from './Projects/OutputFolder.vue'
import ActionsList from './Actions/ActionsList.vue'
import Settings from './Settings.vue'
import SidebarElementVisibility from './Appearance/SidebarElementVisibility.vue'

import { ComputedRef, Ref, computed, ref } from 'vue'
import { Windows } from '@/components/Windows/Windows'
import { Window } from '@/components/Windows/Window'
import { ThemeManager } from '@/libs/theme/ThemeManager'
import { LocaleManager } from '@/libs/locales/Locales'
import { CompletionItem } from '@/libs/jsonSchema/Schema'

interface Category {
	label: string
	icon: string
}

type Item = CustomItem | DropdownItem | AutocompleteItem | ToggleItem | TabItem | TextItem | LabelItem

export interface CustomItem {
	type: 'custom'
	label?: string
	component: any
}

export interface DropdownItem {
	type: 'dropdown'
	label: string
	description: string
	values: ComputedRef<string[]>
	labels: ComputedRef<string[]>
}

export interface AutocompleteItem {
	type: 'autocomplete'
	label: string
	description: string
	completions: ComputedRef<CompletionItem[]>
}

export interface TextItem {
	type: 'text'
	label: string
	description: string
}

export interface ToggleItem {
	type: 'toggle'
	label: string
	description: string
}

export interface TabItem {
	type: 'tab'
	label: string
	description: string
	values: string[]
	labels: string[]
}

export interface LabelItem {
	type: 'label'
	label: string
	description?: string
}

export class SettingsWindow extends Window {
	public static id = 'settings'
	public static component = Settings

	public static categories: Record<string, Category> = {}
	public static items: Record<string, Record<string, Item>> = {}

	public static selectedCategory: Ref<string> = ref('projects')

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

	public static addItem<T extends Item>(category: string, id: string, item: T) {
		SettingsWindow.items[category][id] = item
	}
}

function setupProjectsCategory() {
	SettingsWindow.addCategory('projects', {
		label: 'windows.settings.projects.name',
		icon: 'folder',
	})

	SettingsWindow.addItem('projects', 'outputFolderLabel', {
		type: 'label',
		label: 'Output Folder',
	})

	SettingsWindow.addItem('projects', 'outputFolder', {
		type: 'custom',
		component: OutputFolder,
	})

	SettingsWindow.addItem('projects', 'defaultLabel', {
		type: 'label',
		label: 'Project Defaults',
	})

	SettingsWindow.addItem('projects', 'defaultAuthor', {
		type: 'text',
		label: 'windows.settings.projects.defaultAuthor.name',
		description: 'windows.settings.projects.defaultAuthor.description',
	})

	SettingsWindow.addItem('projects', 'defaultNamespace', {
		type: 'text',
		label: 'windows.settings.projects.defaultNamespace.name',
		description: 'windows.settings.projects.defaultNamespace.description',
	})

	SettingsWindow.addItem('projects', 'exportLabel', {
		type: 'label',
		label: 'Export Settings',
	})

	SettingsWindow.addItem('projects', 'incrementVersionOnExport', {
		type: 'toggle',
		label: 'windows.settings.projects.incrementVersionOnExport.name',
		description: 'windows.settings.projects.incrementVersionOnExport.description',
	})

	SettingsWindow.addItem('projects', 'addGeneratedWith', {
		type: 'toggle',
		label: 'windows.settings.projects.addGeneratedWith.name',
		description: 'windows.settings.projects.addGeneratedWith.description',
	})
}

function setupGeneralCategory() {
	SettingsWindow.addCategory('general', {
		label: 'windows.settings.general.name',
		icon: 'circle',
	})

	SettingsWindow.addItem('general', 'languageLabel', {
		type: 'label',
		label: 'Language Settings',
	})

	SettingsWindow.addItem('general', 'language', {
		type: 'dropdown',
		label: 'windows.settings.general.language.name',
		description: 'windows.settings.general.language.description',
		values: computed(() => LocaleManager.getAvailableLanguages().map((language) => language.text)),
		labels: computed(() => LocaleManager.getAvailableLanguages().map((language) => language.text)),
	})

	SettingsWindow.addItem('general', 'tabLabel', {
		type: 'label',
		label: 'Tab Settings',
	})

	SettingsWindow.addItem('general', 'restoreTabs', {
		type: 'toggle',
		label: 'windows.settings.general.restoreTabs.name',
		description: 'windows.settings.general.restoreTabs.description',
	})

	SettingsWindow.addItem('general', 'keepTabsOpen', {
		type: 'toggle',
		label: 'windows.settings.general.keepTabsOpen.name',
		description: 'windows.settings.general.keepTabsOpen.description',
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

	SettingsWindow.addItem('appearance', 'themeLabel', {
		type: 'label',
		label: 'Theme Settings',
	})

	SettingsWindow.addItem('appearance', 'colorScheme', {
		type: 'tab',
		label: 'windows.settings.appearance.colorScheme.name',
		description: 'windows.settings.appearance.colorScheme.description',
		labels: ['Auto', 'Dark', 'Light'],
		values: ['auto', 'dark', 'light'],
	})

	const themes = ThemeManager.useThemesImmediate()

	const darkThemes = computed(() => themes.value.filter((theme) => theme.colorScheme === 'dark'))
	const lightThemes = computed(() => themes.value.filter((theme) => theme.colorScheme === 'light'))

	SettingsWindow.addItem('appearance', 'darkTheme', {
		type: 'dropdown',
		label: 'windows.settings.appearance.darkTheme.name',
		description: 'windows.settings.appearance.darkTheme.description',
		values: computed(() => darkThemes.value.map((theme) => theme.id)),
		labels: computed(() => darkThemes.value.map((theme) => theme.name)),
	})

	SettingsWindow.addItem('appearance', 'lightTheme', {
		type: 'dropdown',
		label: 'windows.settings.appearance.lightTheme.name',
		description: 'windows.settings.appearance.lightTheme.description',
		values: computed(() => lightThemes.value.map((theme) => theme.id)),
		labels: computed(() => lightThemes.value.map((theme) => theme.name)),
	})

	SettingsWindow.addItem('appearance', 'fontLabel', {
		type: 'label',
		label: 'Font Settings',
	})

	SettingsWindow.addItem('appearance', 'font', {
		type: 'dropdown',
		label: 'windows.settings.appearance.font.name',
		description: 'windows.settings.appearance.font.description',
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
		description: 'windows.settings.appearance.editorFont.description',
		values: computed(() => ['Roboto', 'Arial', 'Consolas', 'Menlo', 'Monaco', '"Courier New"', 'monospace']),
		labels: computed(() => ['Roboto', 'Arial', 'Consolas', 'Menlo', 'Monaco', '"Courier New"', 'Monospace']),
	})

	SettingsWindow.addItem('appearance', 'editorFontSize', {
		type: 'autocomplete',
		label: 'windows.settings.appearance.editorFontSize.name',
		description: 'windows.settings.appearance.editorFontSize.description',
		completions: computed(() =>
			[8, 10, 12, 14, 16, 18, 20].map((value) => ({
				type: 'value',
				label: value.toString(),
				value,
			}))
		),
	})

	SettingsWindow.addItem('appearance', 'compactTabDesign', {
		type: 'toggle',
		label: 'windows.settings.editor.compactTabDesign.name',
		description: 'windows.settings.editor.compactTabDesign.description',
	})

	SettingsWindow.addItem('appearance', 'sideBarLabel', {
		type: 'label',
		label: 'Sidebar Settings',
	})

	SettingsWindow.addItem('appearance', 'sidebarRight', {
		type: 'toggle',
		label: 'windows.settings.sidebar.sidebarRight.name',
		description: 'windows.settings.sidebar.sidebarRight.description',
	})

	SettingsWindow.addItem('appearance', 'sidebarSize', {
		type: 'tab',
		label: 'windows.settings.sidebar.sidebarSize.name',
		description: 'windows.settings.sidebar.sidebarSize.description',
		labels: ['Small', 'Normal', 'Large', 'X-Large'],
		values: ['small', 'normal', 'large', 'x-large'],
	})

	SettingsWindow.addItem('appearance', 'sidebarItemVisibility', {
		type: 'custom',
		label: 'windows.settings.appearance.sidebarElementVisibility.name',
		component: SidebarElementVisibility,
	})

	SettingsWindow.addItem('appearance', 'otherAppearanceLabel', {
		type: 'label',
		label: 'Other Settings',
	})

	SettingsWindow.addItem('appearance', 'fileExplorerIndentation', {
		type: 'tab',
		label: 'windows.settings.appearance.fileExplorerIndentation.name',
		description: 'windows.settings.appearance.fileExplorerIndentation.description',
		labels: ['Small', 'Normal', 'Large', 'X-Large'],
		values: ['small', 'normal', 'large', 'x-large'],
	})
}

function setupEditorCategory() {
	SettingsWindow.addCategory('editor', {
		label: 'windows.settings.editor.name',
		icon: 'edit',
	})

	SettingsWindow.addItem('editor', 'generalEditorLabel', {
		type: 'label',
		label: 'General Editor Settings',
	})

	SettingsWindow.addItem('editor', 'jsonEditor', {
		type: 'dropdown',
		label: 'windows.settings.editor.jsonEditor.name',
		description: 'windows.settings.editor.jsonEditor.description',
		labels: computed(() => ['Raw Text Editor', 'Tree Editor']),
		values: computed(() => ['text', 'tree']),
	})

	SettingsWindow.addItem('editor', 'autoSaveChanges', {
		type: 'toggle',
		label: 'windows.settings.editor.autoSaveChanges.name',
		description: 'windows.settings.editor.autoSaveChanges.description',
	})

	SettingsWindow.addItem('editor', 'textEditorLabel', {
		type: 'label',
		label: 'Text Editor Settings',
	})

	SettingsWindow.addItem('editor', 'formatOnSave', {
		type: 'toggle',
		label: 'windows.settings.editor.formatOnSave.name',
		description: 'windows.settings.editor.formatOnSave.description',
	})

	SettingsWindow.addItem('editor', 'bracketPairColorization', {
		type: 'toggle',
		label: 'windows.settings.editor.bracketPairColorization.name',
		description: 'windows.settings.editor.bracketPairColorization.description',
	})

	SettingsWindow.addItem('editor', 'wordWrap', {
		type: 'toggle',
		label: 'windows.settings.editor.wordWrap.name',
		description: 'windows.settings.editor.wordWrap.description',
	})

	SettingsWindow.addItem('editor', 'wordWrapColumns', {
		type: 'autocomplete',
		label: 'windows.settings.editor.wordWrapColumns.name',
		description: 'windows.settings.editor.wordWrapColumns.description',
		completions: computed(() =>
			[40, 60, 80, 100, 120, 160].map((value) => ({
				type: 'value',
				label: value.toString(),
				value,
			}))
		),
	})

	SettingsWindow.addItem('editor', 'treeLabel', {
		type: 'label',
		label: 'Tree Editor Settings',
	})

	SettingsWindow.addItem('editor', 'bridgePredictions', {
		type: 'toggle',
		label: 'windows.settings.editor.bridgePredictions.name',
		description: 'windows.settings.editor.bridgePredictions.description',
	})

	SettingsWindow.addItem('editor', 'inlineDiagnostics', {
		type: 'toggle',
		label: 'windows.settings.editor.inlineTreeEditorDiagnostics.name',
		description: 'windows.settings.editor.inlineTreeEditorDiagnostics.description',
	})

	SettingsWindow.addItem('editor', 'showArrayIndices', {
		type: 'toggle',
		label: 'windows.settings.editor.showArrayIndices.name',
		description: 'windows.settings.editor.showArrayIndices.description',
	})

	SettingsWindow.addItem('editor', 'hideBrackets', {
		type: 'toggle',
		label: 'windows.settings.editor.hideBrackets.name',
		description: 'windows.settings.editor.hideBrackets.description',
	})

	SettingsWindow.addItem('editor', 'automaticallyOpenTreeNodes', {
		type: 'toggle',
		label: 'windows.settings.editor.automaticallyOpenTreeNodes.name',
		description: 'windows.settings.editor.automaticallyOpenTreeNodes.description',
	})

	SettingsWindow.addItem('editor', 'dragAndDropTreeNodes', {
		type: 'toggle',
		label: 'windows.settings.editor.dragAndDropTreeNodes.name',
		description: 'windows.settings.editor.dragAndDropTreeNodes.description',
	})
}

function setupDeveloperCategory() {
	SettingsWindow.addCategory('developer', {
		label: 'windows.settings.developer.name',
		icon: 'code',
	})

	SettingsWindow.addItem('developer', 'developerLabel', {
		type: 'label',
		label: 'Developer Settings',
	})

	SettingsWindow.addItem('developer', 'dataDeveloperMode', {
		type: 'toggle',
		label: 'windows.settings.developer.dataDeveloperMode.name',
		description: 'windows.settings.developer.dataDeveloperMode.description',
	})
}
