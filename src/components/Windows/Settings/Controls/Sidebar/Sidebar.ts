import { Control, IControl } from '../Control'
import SidebarComponent from './Sidebar.vue'
import { App } from '/@/App'
import { translate } from '/@/components/Locales/Manager'

export class Sidebar extends Control<any> {
	constructor(config: IControl<any>) {
		super(SidebarComponent, config)
	}

	matches(filter: string) {
		return Object.values(App.sidebar.elements).some((sidebar) =>
			translate(sidebar.displayName).includes(filter)
		)
	}
}
