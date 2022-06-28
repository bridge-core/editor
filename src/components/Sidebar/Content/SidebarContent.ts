import { Component } from 'vue'
import { SelectableSidebarAction } from './SelectableSidebarAction'
import { SidebarAction } from './SidebarAction'
import { InfoPanel } from '/@/components/InfoPanel/InfoPanel'

export abstract class SidebarContent {
	protected headerSlot?: Component
	protected headerHeight?: string
	protected topPanel?: InfoPanel
	protected actions?: SidebarAction[] = []
	public selectedAction?: SidebarAction = undefined
	protected abstract component: Component

	unselectAllActions() {
		this.actions?.forEach((action) =>
			action instanceof SelectableSidebarAction
				? action.unselect()
				: undefined
		)
		this.selectedAction = undefined
	}
	getSelectedAction() {
		return this.actions?.find(
			(action) =>
				action instanceof SelectableSidebarAction && action.isSelected
		)
	}

	onContentRightClick(event: MouseEvent) {}
}
