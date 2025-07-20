import { Project } from './Project'
import { ITabPreviewConfig } from '/@/components/TabSystem/TabActions/Provider'

import { createFromGeometry } from '/@/components/Editors/EntityModel/create/fromGeometry'
import { createFromClientEntity } from '/@/components/Editors/EntityModel/create/fromClientEntity'
import { createFromEntity } from '/@/components/Editors/EntityModel/create/fromEntity'
import { ParticlePreviewTab } from '/@/components/Editors/ParticlePreview/ParticlePreview'
import { BlockModelTab } from '/@/components/Editors/BlockModel/Tab'
import { CommandData } from '/@/components/Languages/Mcfunction/Data'
// import { WorldTab } from '/@/components/BedrockWorlds/Render/Tab'
import { FileTab } from '../../TabSystem/FileTab'
import { HTMLPreviewTab } from '../../Editors/HTMLPreview/HTMLPreview'
import { LangData } from '/@/components/Languages/Lang/Data'
import { MolangData } from '../../Languages/Molang/Data'
import { ColorData } from '../../Languages/Json/ColorPicker/Data'

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
		createPreview: async (tabSystem, tab) => {
			const previewTab = new BlockModelTab(tab.getPath(), tab, tabSystem)
			previewTab.setPreviewOptions({ loadComponents: true })

			return previewTab
		},
	},
	/*{
		name: 'preview.simulateLoot',
		fileType: 'lootTable',
		createPreview: async (tabSystem, tab) =>
			new LootTableSimulatorTab(tab, tabSystem),
	},*/
]

export class BedrockProject extends Project {
	commandData = new CommandData()
	langData = new LangData()
	molangData = new MolangData()
	colorData = new ColorData()

	onCreate() {
		bedrockPreviews.forEach((tabPreview) =>
			this.tabActionProvider.registerPreview(tabPreview)
		)

		this.tabActionProvider.register({
			name: 'preview.name',
			icon: 'mdi-play',
			isFor: (tab) => {
				return (
					tab instanceof FileTab &&
					tab.getFileHandle().name.endsWith('.html')
				)
			},
			trigger: (tab) => {
				const inactiveTabSystem = this.app.project.inactiveTabSystem
				if (!inactiveTabSystem) return

				inactiveTabSystem.add(
					new HTMLPreviewTab(inactiveTabSystem, {
						filePath: tab.getPath(),
						fileHandle: tab.getFileHandle(),
					})
				)
				inactiveTabSystem.setActive(true)
			},
		})

		this.commandData.loadCommandData('minecraftBedrock')
		this.langData.loadLangData('minecraftBedrock')
		this.molangData.loadCommandData('minecraftBedrock')
		this.colorData.loadColorData()
	}

	getCurrentDataPackage() {
		return this.app.dataLoader.getDirectoryHandle(
			`data/packages/minecraftBedrock`
		)
	}
}
