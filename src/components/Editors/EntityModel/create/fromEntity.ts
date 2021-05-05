import json5 from 'json5'
import { FileTab } from '../../../TabSystem/FileTab'
import { InformationWindow } from '../../../Windows/Common/Information/InformationWindow'
import { EntityModelTab } from '../Tab'
import { App } from '/@/App'

export async function createFromEntity(tab: FileTab) {
	const app = await App.getApp()
	const packIndexer = app.project.packIndexer.service

	const file = await tab.getFile()
	const fileContent = await file.text()

	let entityData: any
	try {
		entityData = json5.parse(fileContent)?.['minecraft:entity'] ?? {}
	} catch {
		return
	}

	const clientEntity = await packIndexer.find('clientEntity', 'identifier', [
		entityData?.description?.identifier,
	])
	if (clientEntity.length === 0) {
		new InformationWindow({
			description: 'preview.failedClientEntityLoad',
		})
		return
	}

	const previewTab = new EntityModelTab(
		clientEntity[0],
		tab,
		tab.tabSystem,
		tab.getFileHandle()
	)
	previewTab.setPreviewOptions({ loadServerEntity: true })

	return previewTab
}
