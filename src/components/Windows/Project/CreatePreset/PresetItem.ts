import {
	ISidebarItemConfig,
	SidebarItem,
} from '/@/components/Windows/Layout/Sidebar'

export class PresetItem extends SidebarItem {
	public readonly resetState: () => void

	constructor(config: ISidebarItemConfig & { resetState: () => void }) {
		super(config)

		this.resetState = config.resetState
	}
}
