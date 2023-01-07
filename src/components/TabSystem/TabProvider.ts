import { CodemirrorTab } from '../Editors/Codemirror/CodemirrorTab'
import { ImageTab } from '../Editors/Image/ImageTab'
import { TargaTab } from '../Editors/Image/TargaTab'
import { SoundTab } from '../Editors/Sound/SoundTab'
import { TextTab } from '../Editors/Text/TextTab'
import { TreeTab } from '../Editors/TreeEditor/Tab'
import { FileTab } from './FileTab'

export class TabProvider {
	protected static _tabs = new Set<typeof FileTab>(
		[
			TextTab,
			CodemirrorTab,
			TreeTab,
			ImageTab,
			TargaTab,
			SoundTab,
		].reverse()
	)
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
