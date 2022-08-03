import { Sidebar } from '/@/components/Windows/Layout/Sidebar'
import { Control } from './Controls/Control'

export class SettingsSidebar extends Sidebar {
	protected lastFilter!: string

	get elements() {
		let selectSidebar: string | undefined = undefined

		const elements = this._elements.value.filter((element) => {
			if (element.type === 'category') return true

			const controls = <Control<any>[]>this.getState(element.id)
			const hasControl = controls.some((control) =>
				control.matches(this.filter)
			)
			if (!selectSidebar && hasControl) selectSidebar = element.id
			return hasControl
		})

		if (
			selectSidebar &&
			this.lastFilter !== this.filter &&
			this.currentState.length === 0
		)
			this.setDefaultSelected(selectSidebar)
		this.lastFilter = this.filter
		return this.sortSidebar(elements)
	}

	get currentState() {
		if (!this.selected) return []
		return (<Control<any>[]>this.state[this.selected] ?? []).filter(
			(control) => control.matches(this.filter)
		)
	}
}
