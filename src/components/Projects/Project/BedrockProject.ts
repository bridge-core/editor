import { Project } from './Project'
import { ITabPreviewConfig } from '/@/components/TabSystem/TabActions/Provider'

import { createFromGeometry } from '/@/components/Editors/EntityModel/create/fromGeometry'
import { createFromClientEntity } from '/@/components/Editors/EntityModel/create/fromClientEntity'
import { createFromEntity } from '/@/components/Editors/EntityModel/create/fromEntity'
import { ParticlePreviewTab } from '/@/components/Editors/ParticlePreview/ParticlePreview'
import { BlockModelTab } from '../../Editors/BlockModel/Tab'
import { CommandData } from '../../Languages/Mcfunction/Data'

const bedrockPreviews: ITabPreviewConfig[] = [
	{
		name: 'preview.viewModel',
		fileMatch: 'RP/models/',
		createPreview: (tabSystem, tab) => createFromGeometry(tabSystem, tab),
	},
	{
		name: 'preview.viewModel',
		fileMatch: 'RP/entity/',
		createPreview: (tabSystem, tab) =>
			createFromClientEntity(tabSystem, tab),
	},
	{
		name: 'preview.viewEntity',
		fileMatch: 'BP/entities/',
		createPreview: (tabSystem, tab) => createFromEntity(tabSystem, tab),
	},
	{
		name: 'preview.viewParticle',
		fileMatch: 'RP/particles/',
		createPreview: async (tabSystem, tab) =>
			new ParticlePreviewTab(tab, tabSystem),
	},
	{
		name: 'preview.viewBlock',
		fileMatch: 'BP/blocks/',
		createPreview: async (tabSystem, tab) =>
			new BlockModelTab(tab.getProjectPath(), tab, tabSystem),
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
