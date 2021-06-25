import { Component } from 'vue'
import { SelectableSidebarAction } from './SelectableSidebarAction'
import { SidebarAction } from './SidebarAction'

export abstract class SidebarContent {
	protected abstract actions?: SidebarAction[]
	public selectedAction?: SidebarAction = undefined
	protected abstract component: Component

	unselectAllActions() {
		this.actions?.forEach((action) =>
			action instanceof SelectableSidebarAction
				? action.unselect()
				: undefined
		)
	}
	getSelectedAction() {
		return this.actions?.find(
			(action) =>
				action instanceof SelectableSidebarAction && action.isSelected
		)
	}
}
