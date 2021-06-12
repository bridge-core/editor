import { ImageTab } from '../Editors/Image/ImageTab'
import { TextTab } from '../Editors/Text/TextTab'
import { TreeTab } from '../Editors/TreeEditor/Tab'
import { FileTab } from './FileTab'

export class TabProvider {
	protected static _tabs = new Set<typeof FileTab>([
		ImageTab,
		TreeTab,
		TextTab,
	])
	static get tabs() {
		return [...this._tabs]
	}

	static register(tab: typeof FileTab) {
		this._tabs.add(tab)

		return {
			dispose: () => this._tabs.delete(tab),
		}
	}
}
