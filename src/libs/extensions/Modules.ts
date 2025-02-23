import { Sidebar } from '@/components/Sidebar/Sidebar'
import { Extensions } from './Extensions'
import { TabManager } from '@/components/TabSystem/TabManager'
import { Tab } from '@/components/TabSystem/Tab'
import { appVersion, isNightly } from '@/libs/app/AppEnv'
import { ProjectManager } from '@/libs/project/ProjectManager'

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

	Extensions.registerModule('@bridge/env', () => ({
		appVersion,
		isNightly,
		getCurrentProject() {
			return ProjectManager.currentProject
		},
		getProjectBPPath() {
			return ProjectManager.currentProject?.resolvePackPath('behaviorPack') ?? null
		},
		getProjectRPPath() {
			return ProjectManager.currentProject?.resolvePackPath('resourcePack') ?? null
		},
		getProjectNamespace() {
			return ProjectManager.currentProject?.config?.namespace ?? null
		},
		getProjectTargetVersion() {
			return ProjectManager.currentProject?.config?.targetVersion ?? null
		},
		getProjectAuthors() {
			return ProjectManager.currentProject?.config?.authors ?? null
		},
		resolvePackPath(packId: string, filePath: string) {
			return ProjectManager.currentProject?.resolvePackPath(packId, filePath) ?? null
		},
	}))

	Extensions.registerModule('@bridge/com-mojang', () => ({}))

	Extensions.registerModule('@bridge/fs', () => ({}))
}
