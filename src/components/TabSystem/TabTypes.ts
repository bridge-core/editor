import { TextTab } from '@/components/Tabs/Text/TextTab'
import { TreeEditorTab } from '@/components/Tabs/TreeEditor/TreeEditorTab'
import { ImageTab } from '@/components/Tabs/Image/ImageTab'
import { FileTab } from './FileTab'
import { FindAndReplaceTab } from '@/components/Tabs/FindAnReplace/FindAndReplaceTab'
import { Tab } from './Tab'
import { Settings } from '@/libs/settings/Settings'

export class TabTypes {
	public static tabTypes: (typeof Tab | typeof FileTab)[] = [ImageTab, TextTab, TreeEditorTab, FindAndReplaceTab]
	public static fileTabTypes: (typeof FileTab)[] = [ImageTab, TextTab, TreeEditorTab]

	public static setup() {
		Settings.addSetting('jsonEditor', {
			default: 'text',
		})

		Settings.updated.on((event) => {
			const { id, value } = event as { id: string; value: any }

			if (id !== 'jsonEditor') return

			if (value === 'text') {
				this.fileTabTypes = [ImageTab, TextTab, TreeEditorTab]
			} else {
				this.fileTabTypes = [ImageTab, TreeEditorTab, TextTab]
			}
		})
	}

	public static getType(id: string): typeof Tab | typeof FileTab | null {
		return this.tabTypes.find((tabType) => tabType.name === id) ?? null
	}
}
