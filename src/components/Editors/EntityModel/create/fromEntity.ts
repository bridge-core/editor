import json5 from 'json5'
import { FileTab } from '/@/components/TabSystem/FileTab'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'
import { EntityModelTab } from '../Tab'
import { App } from '/@/App'
import { TabSystem } from '/@/components/TabSystem/TabSystem'

export async function createFromEntity(tabSystem: TabSystem, tab: FileTab) {
	const app = await App.getApp()
	await app.project.packIndexer.fired
	const packIndexer = app.project.packIndexer.service

	const file = await tab.getFile()
	const fileContent = await file.text()

	let entityData: any
	try {
		entityData = json5.parse(fileContent)?.['minecraft:entity'] ?? {}
	} catch {
		new InformationWindow({
			description: 'preview.invalidEntity',
		})
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
		{ clientEntityFilePath: clientEntity[0] },
		tab,
		tabSystem
	)
	previewTab.setPreviewOptions({ loadServerEntity: true })

	return previewTab
}
