import { Project } from './Project'
import { ITabPreviewConfig } from '/@/components/TabSystem/TabActions/Provider'

import { createFromGeometry } from '/@/components/Editors/EntityModel/create/fromGeometry'
import { createFromClientEntity } from '/@/components/Editors/EntityModel/create/fromClientEntity'
import { createFromEntity } from '/@/components/Editors/EntityModel/create/fromEntity'
import { ParticlePreviewTab } from '/@/components/Editors/ParticlePreview/ParticlePreview'
import { FunctionValidatorTab } from '../../Editors/FunctionValidator/Tab'
import { BlockModelTab } from '/@/components/Editors/BlockModel/Tab'
import { CommandData } from '/@/components/Languages/Mcfunction/Data'
import { WorldTab } from '/@/components/BedrockWorlds/Render/Tab'

const bedrockPreviews: ITabPreviewConfig[] = [
	{
		name: 'preview.viewModel',
		fileType: 'geometry',
		createPreview: (tabSystem, tab) => createFromGeometry(tabSystem, tab),
	},
	{
		name: 'preview.viewModel',
		fileType: 'clientEntity',
		createPreview: (tabSystem, tab) =>
			createFromClientEntity(tabSystem, tab),
	},
	{
		name: 'preview.viewEntity',
		fileType: 'entity',
		createPreview: (tabSystem, tab) => createFromEntity(tabSystem, tab),
	},
	{
		name: 'preview.viewParticle',
		fileType: 'particle',
		createPreview: async (tabSystem, tab) =>
			new ParticlePreviewTab(tab, tabSystem),
	},
	{
		name: 'preview.viewBlock',
		fileType: 'block',
		createPreview: async (tabSystem, tab) =>
			new BlockModelTab(tab.getPath(), tab, tabSystem),
	},
	{
		name: 'functionValidator.actionName',
		fileType: 'function',
		createPreview: async (tabSystem, tab) =>
			new FunctionValidatorTab(tabSystem, tab),
	},
]

export class BedrockProject extends Project {
	commandData = new CommandData()

	onCreate() {
		bedrockPreviews.forEach((tabPreview) =>
			this.tabActionProvider.registerPreview(tabPreview)
		)
		this.commandData.loadCommandData('minecraftBedrock')
	}

	getCurrentDataPackage() {
		return this.app.dataLoader.getDirectoryHandle(
			`data/packages/minecraftBedrock`
		)
	}
}
