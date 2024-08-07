import { Sidebar } from '@/components/Sidebar/Sidebar'
import { Extensions } from './Extensions'

export function setupModules() {
	Extensions.registerModule('@bridge/sidebar', () => ({
		create: function (item: { id: string; displayName: string; icon: string; component: any }) {
			Sidebar.addButton(item.icon, () => {})
		},
	}))

	Extensions.registerModule('@bridge/ui', () => ({
		BuiltIn: {},
	}))

	Extensions.registerModule('@bridge/fs', () => ({}))
}
