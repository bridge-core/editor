import { SidebarContent } from '/@/components/Sidebar/Content/SidebarContent'
import ContentComponent from './Content.vue'
import { SidebarAction } from '/@/components/Sidebar/Content/SidebarAction'
import { App } from '/@/App'

export class SourceControl extends SidebarContent {
	component = ContentComponent
	protected actions: SidebarAction[] = []

	constructor() {
		super()

		// Source control actions should only show once user is logged in
		App.getApp().then((app) => {
			app.oAuth.token.fired.then(() => {
				this.createActions()
			})
		})
	}

	createActions() {
		this.actions.push(
			new SidebarAction({
				icon: 'mdi-sync',
				name: 'sourceControl.actions.fetch',
				color: 'primary',
				onTrigger: () => {},
			}),
			new SidebarAction({
				icon: 'mdi-source-branch',
				name: 'sourceControl.actions.changeBranch',
				onTrigger: () => {},
			}),
			new SidebarAction({
				icon: 'mdi-dots-vertical',
				name: 'general.more',
				onTrigger: () => {},
			})
		)
	}
}
