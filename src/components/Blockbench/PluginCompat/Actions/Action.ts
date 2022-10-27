import { BarItem, BarItemOptions } from './BarItem'

interface ActionOptions extends BarItemOptions {
	click(event: Event): void
	color?: string
	linked_setting?: string
	children?: object[]
	/**
	 * Show the full label in toolbars
	 */
	label?: boolean
}

export class BlockbenchAction extends BarItem {
	nodes: HTMLElement[] = []
	/**
	 * Provide a menu that belongs to the action, and gets displayed as a small arrow next to it in toolbars.
	 */
	side_menu?: Menu

	constructor(id: string, public readonly options: ActionOptions) {
		super(id, options)
	}
	/**
	 * Trigger to run or select the action. This is the equivalent of clicking or using a keybind to trigger it. Also checks if the condition is met.
	 */
	trigger(event: Event) {}
	updateKeybindingLabel() {
		return this
	}
	/** Change the icon of the action */
	setIcon(icon: string): void {}
	toggleLinkedSetting(change: any): void {}
}
