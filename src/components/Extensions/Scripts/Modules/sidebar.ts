import { IModuleConfig } from '../types'
import { createSidebar } from '@/components/Sidebar/create'
import { selectSidebar } from '@/components/Sidebar/state'

export const SidebarModule = ({ disposables }: IModuleConfig) => ({
	create(config: {
		id?: string
		displayName: string
		component: string
		icon: string
	}) {
		const sidebar = createSidebar(config)
		disposables.push(sidebar)
		return sidebar
	},

	getSelected() {
		throw new Error(`This function no longer works with bridge. v2`)
	},
	onChange() {
		throw new Error(`This function no longer works with bridge. v2`)
	},
	select: selectSidebar,
})
