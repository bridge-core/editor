import { EntityModelTab } from '../Tab'
import { FileTab } from '/@/components/TabSystem/FileTab'

export async function createFromClientEntity(tab: FileTab) {
	return new EntityModelTab(
		tab.getProjectPath(),
		tab,
		tab.tabSystem,
		tab.getFileHandle()
	)
}
