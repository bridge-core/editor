import json5 from 'json5'
import { BlockModelTab } from '../../BlockModel/Tab'
import { EntityModelTab } from '../Tab'
import { transformOldModels } from '../transformOldModels'
import { App } from '/@/App'
import { FileTab } from '/@/components/TabSystem/FileTab'
import { TabSystem } from '/@/components/TabSystem/TabSystem'
import { DropdownWindow } from '/@/components/Windows/Common/Dropdown/DropdownWindow'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'

export async function createFromGeometry(tabSystem: TabSystem, tab: FileTab) {
	const app = await App.getApp()
	await app.project.packIndexer.fired
	const packIndexer = app.project.packIndexer.service

	const file = await tab.getFile()
	const fileContent = await file.text()

	let modelJson: any
	try {
		modelJson = transformOldModels(json5.parse(fileContent))
	} catch {
		return
	}

	const availableModels = modelJson['minecraft:geometry']
		.map((geo: any) => geo?.description?.identifier)
		.filter((id: string | undefined) => id !== undefined)

	// By default assume user wants to load first model
	let choice = availableModels[0]
	if (availableModels.length > 1) {
		// Prompt user to choose a model if multiple are available
		const choiceWindow = new DropdownWindow({
			default: availableModels[0],
			options: availableModels,
			name: 'preview.chooseGeometry',
			isClosable: false,
		})
		choice = await choiceWindow.fired
	}
	if (!choice) {
		new InformationWindow({ description: 'preview.noGeometry' })
		return
	}

	const clientEntity = await packIndexer.find(
		'clientEntity',
		'geometryIdentifier',
		[choice]
	)

	if (clientEntity.length === 0) {
		// Check whether geometry is connected to a block
		const block = await packIndexer.find('block', 'geometryIdentifier', [
			choice,
		])
		// Connected block found
		if (block.length > 0) {
			const previewTab = new BlockModelTab(block[0], tab, tabSystem)
			previewTab.setPreviewOptions({ loadComponents: false })
			return previewTab
		}
	}

	/**
	 *  If we reach this point either...
	 *  - ...a connected client entity was found (clientEntity.length > 0)...
	 * 	- ...or no connected client entity and no connected block was found -> Fallback to geometry preview in this case.
	 */
	return new EntityModelTab(
		{
			clientEntityFilePath: clientEntity[0],
			geometryFilePath: tab.getPath(),
			geometryIdentifier: choice,
		},
		tab,
		tabSystem
	)
}
