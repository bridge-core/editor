import { Control, IControl } from '../Control'
import SidebarComponent from './Sidebar.vue'
import { App } from '/@/App'
import { SidebarState } from '/@/components/Sidebar/state'

export class Sidebar extends Control<any> {
	constructor(config: IControl<any>) {
		super(SidebarComponent, config)
	}

	matches(filter: string) {
		return Object.values(SidebarState.sidebarElements).some((sidebar) =>
			App.instance.locales.translate(sidebar.displayName).includes(filter)
		)
	}
}
