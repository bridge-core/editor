import { PackType } from '/@/components/Data/PackType'
import { InformedChoiceWindow } from '/@/components/Windows/InformedChoice/InformedChoice'
import { App } from '/@/App'
import { CreateBP } from '../CreateProject/Packs/BP'
import { CreateProjectWindow } from '../CreateProject/CreateProject'
import { CreateRP } from '../CreateProject/Packs/RP'
import { CreateSP } from '../CreateProject/Packs/SP'
import { CreateWT } from '../CreateProject/Packs/WT'

export async function addPack() {
	const app = await App.getApp()
	const window = new InformedChoiceWindow('windows.projectChooser.addPack')
	const actionManager = await window.actionManager

	const createdPacks = app.project.getPacks()

	const createablePacks = PackType.all().filter(
		(packType) => !createdPacks.includes(packType.id)
	)

	createablePacks.forEach((packType) =>
		actionManager.create({
			icon: packType.icon,
			color: packType.color,
			name: `packType.${packType.id}.name`,
			description: `packType.${packType.id}.description`,

			onTrigger: async () => {
				app.windows.loadingWindow.open()
				const scopedFs = app.project.fileSystem
				const defaultOptions = await CreateProjectWindow.loadFromConfig()
				let packPath: string

				switch (packType.id) {
					case 'behaviorPack': {
						await new CreateBP().create(scopedFs, defaultOptions)
						packPath = 'BP'
						break
					}
					case 'resourcePack': {
						await new CreateRP().create(scopedFs, defaultOptions)
						packPath = 'RP'
						break
					}
					case 'skinPack': {
						await new CreateSP().create(scopedFs, defaultOptions)
						packPath = 'SP'
						break
					}
					case 'worldTemplate': {
						await new CreateWT().create(scopedFs, defaultOptions)
						packPath = 'WT'
						break
					}
					default: {
						app.windows.loadingWindow.close()
						throw new Error(
							`Unable to add pack with id "${packType.id}"`
						)
					}
				}

				const configJson = await scopedFs.readJSON('config.json')
				await scopedFs.writeJSON(
					'config.json',
					{
						...configJson,
						packs: {
							...(configJson.packs ?? {}),
							[packType.id]: `./${packType.packPath}`,
						},
					},
					true
				)

				app.project.addPack({ ...packType, version: [1, 0, 0] })

				app.project.recompileChangedFiles()
				App.eventSystem.dispatch('projectChanged', undefined)

				app.windows.loadingWindow.close()
			},
		})
	)

	window.open()
}
