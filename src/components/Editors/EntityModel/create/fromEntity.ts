import { FileTab } from '../../../TabSystem/FileTab'
import { InformationWindow } from '../../../Windows/Common/Information/InformationWindow'
import { EntityModelTab } from '../Tab'
import { App } from '/@/App'

export async function createFromEntity(identifier: string, tab: FileTab) {
	const app = await App.getApp()
	const packIndexer = app.project.packIndexer.service

	const clientEntity = await packIndexer.find('clientEntity', 'identifier', [
		identifier,
	])
	console.log(clientEntity)
	if (clientEntity.length === 0)
		return new InformationWindow({
			description: 'preview.failedClientEntityLoad',
		})

	return new EntityModelTab(
		clientEntity[0],
		tab,
		tab.tabSystem,
		tab.getFileHandle()
	)
}
