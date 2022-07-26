import { Control, IControl } from '../Control'
import SidebarComponent from './Sidebar.vue'
import { App } from '/@/App'

export class Sidebar extends Control<any> {
	constructor(config: IControl<any>) {
		super(SidebarComponent, config)
	}

	matches(filter: string) {
		return Object.values(App.sidebar.elements).some((sidebar) =>
			App.instance.locales.translate(sidebar.displayName).includes(filter)
		)
	}
}
