import { ImageTab } from '../Editors/Image/ImageTab'
import { TargaTab } from '../Editors/Image/TargaTab'
import { JigsawTab } from '../Editors/Jigsaw/Tab'
import { SoundTab } from '../Editors/Sound/SoundTab'
import { TextTab } from '../Editors/Text/TextTab'
import { TreeTab } from '../Editors/TreeEditor/Tab'
import { FileTab } from './FileTab'

export class TabProvider {
	protected static _tabs = new Set<typeof FileTab>([
		TextTab,
		JigsawTab,
		TreeTab,
		ImageTab,
		TargaTab,
		SoundTab,
	])
	static get tabs() {
		return [...this._tabs].reverse()
	}

	static register(tab: typeof FileTab) {
		this._tabs.add(tab)

		return {
			dispose: () => this._tabs.delete(tab),
		}
	}
}
