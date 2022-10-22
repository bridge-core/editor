import GeneralTab from './Tabs/GeneralTab.vue'
import FilesTab from './Tabs/FilesTab.vue'
import ExperimentalGameplayTab from './Tabs/ExperimentalGameplayTab.vue'
import ProjectTypeTab from './Tabs/ProjectTypeTab.vue'

interface ICreateCategory {
	icon: string
	id: string
	component: any
}

export const createCategories: ICreateCategory[] = [
	{
		icon: 'mdi-circle-outline',
		id: 'general',
		component: GeneralTab,
	},
	{
		icon: 'mdi-package-variant-closed',
		id: 'projectType',
		component: ProjectTypeTab,
	},
	{
		icon: 'mdi-test-tube',
		id: 'experimentalGameplay',
		component: ExperimentalGameplayTab,
	},
	{
		icon: 'mdi-file-outline',
		id: 'files',
		component: FilesTab,
	},
]
