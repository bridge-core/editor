import { App } from '/@/App'
import { Project } from './Project'
import {
	ITabActionConfig,
	ITabPreviewConfig,
} from '/@/components/TabSystem/TabActions/Provider'

import { createFromGeometry } from '/@/components/Editors/EntityModel/create/fromGeometry'
import { createFromClientEntity } from '/@/components/Editors/EntityModel/create/fromClientEntity'
import { createFromEntity } from '/@/components/Editors/EntityModel/create/fromEntity'
import { ParticlePreviewTab } from '/@/components/Editors/ParticlePreview/ParticlePreview'
import { BlockModelTab } from '../../Editors/BlockModel/Tab'

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
			new ParticlePreviewTab(tab, tabSystem, tab.getFileHandle()),
	},
	{
		name: 'preview.viewBlock',
		fileMatch: 'BP/blocks/',
		createPreview: async (tabSystem, tab) =>
			new BlockModelTab(
				tab.getProjectPath(),
				tab,
				tabSystem,
				tab.getFileHandle()
			),
	},
]

export class BedrockProject extends Project {
	onCreate() {
		bedrockPreviews.forEach((tabPreview) =>
			this.tabActionProvider.registerPreview(tabPreview)
		)
	}
}
