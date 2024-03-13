import { Windows } from '@/components/Windows/Windows'
import { Ref, ref } from 'vue'

interface CategoryDefinition {
	label: string
	icon: string
}

export class SettingsWindow {
	public static categories: Record<string, CategoryDefinition> = {}

	public static selectedCategory: Ref<string | null> = ref('projects')

	public static openSettings(categoryId?: string) {
		Windows.open('settings')

		if (!categoryId) return

		SettingsWindow.selectedCategory.value = categoryId
	}

	public static addCategory(id: string, definition: CategoryDefinition) {
		SettingsWindow.categories[id] = definition
	}
}

SettingsWindow.addCategory('projects', {
	label: 'windows.settings.projects.name',
	icon: 'folder',
})

SettingsWindow.addCategory('general', {
	label: 'windows.settings.general.name',
	icon: 'circle',
})

SettingsWindow.addCategory('editor', {
	label: 'windows.settings.editor.name',
	icon: 'edit',
})

SettingsWindow.addCategory('actions', {
	label: 'windows.settings.actions.name',
	icon: 'keyboard',
})

SettingsWindow.addCategory('appearance', {
	label: 'windows.settings.appearance.name',
	icon: 'palette',
})
