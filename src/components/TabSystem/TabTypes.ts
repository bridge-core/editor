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
	}

	public static getType(id: string): typeof Tab | typeof FileTab | null {
		return this.tabTypes.find((tabType) => tabType.name === id) ?? null
	}

	public static addTabType(tabType: typeof Tab | typeof FileTab) {
		this.tabTypes.push(tabType)
	}

	public static removeTabType(tabType: typeof Tab | typeof FileTab) {
		this.tabTypes.splice(this.tabTypes.indexOf(tabType))
	}

	public static addFileTabType(tabType: typeof FileTab) {
		this.tabTypes.push(tabType)
		this.fileTabTypes.push(tabType)
	}

	public static removeFileTabType(tabType: typeof FileTab) {
		this.tabTypes.splice(this.tabTypes.indexOf(tabType))
		this.fileTabTypes.splice(this.fileTabTypes.indexOf(tabType))
	}
}
