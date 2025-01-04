import { Sidebar } from '@/components/Sidebar/Sidebar'
import { Extensions } from './Extensions'
import { TabManager } from '@/components/TabSystem/TabManager'
import { Tab } from '@/components/TabSystem/Tab'

export function setupModules() {
	Extensions.registerModule('@bridge/sidebar', () => ({
		create: function (item: { id: string; displayName: string; icon: string; component: any }) {
			Sidebar.addButton(item.id, item.displayName, item.icon, () => {
				const tab = new Tab()
				tab.component = item.component
				tab.name.value = item.displayName
				tab.icon.value = item.icon

				TabManager.openTab(tab)
			})
		},
	}))

	Extensions.registerModule('@bridge/ui', () => {
		return {
			...Extensions.ui,
			BuiltIn: {},
		}
	})

	Extensions.registerModule('@bridge/fs', () => ({}))
}
