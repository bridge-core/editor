import GeneralTab from './Tabs/GeneralTab.vue'
import FilesTab from './Tabs/CreateFile/Tab.vue'
import ExperimentalGameplayTab from './Tabs/ExperimentalGameplay/Tab.vue'
import ProjectTypeTab from './Tabs/ProjectType/Tab.vue'
import PackTypeTab from './Tabs/PackTypeTab.vue'

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
		icon: 'mdi-wrench',
		id: 'packType',
		component: PackTypeTab,
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
