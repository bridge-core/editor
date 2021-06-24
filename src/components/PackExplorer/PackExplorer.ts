import {
	ContentAction,
	SidebarContent,
} from '/@/components/Sidebar/Content/SidebarContent'
import PackExplorerComponent from './PackExplorer.vue'
import { App } from '/@/App'

export class PackExplorer extends SidebarContent {
	component = PackExplorerComponent
	actions: ContentAction[] = []

	constructor() {
		super()

		App.eventSystem.on('projectChanged', () => {
			App.getApp().then((app) => {
				this.actions =
					app.project.projectData.contains?.map(
						(pack) =>
							new ContentAction({
								icon: pack.icon,
								color: pack.color,
								onClick: () => {},
							})
					) ?? []
				this.actions.push(
					new ContentAction({
						icon: 'mdi-dots-vertical',
						onClick: () => {},
					})
				)
			})
		})
	}
}
