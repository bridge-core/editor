import { SidebarAction, ISidebarAction } from './SidebarAction'
import type { SidebarContent } from './SidebarContent'

export class SelectableSidebarAction extends SidebarAction {
	protected _isSelected = false

	constructor(protected parent: SidebarContent, config: ISidebarAction) {
		super(config)
		if (!this.parent.selectedAction) this.select()
	}
	get isSelected() {
		return this._isSelected
	}

	select() {
		this.parent.unselectAllActions()
		this._isSelected = true
		this.parent.selectedAction = this
	}
	unselect() {
		if (this._isSelected) this.parent.selectedAction = undefined
		this._isSelected = false
	}
}
