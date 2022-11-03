import { EntityModelTab } from '../Tab'
import { FileTab } from '/@/components/TabSystem/FileTab'
import { TabSystem } from '/@/components/TabSystem/TabSystem'

export async function createFromClientEntity(
	tabSystem: TabSystem,
	tab: FileTab
) {
	return new EntityModelTab(
		{ clientEntityFilePath: tab.getPath() },
		tab,
		tabSystem
	)
}
