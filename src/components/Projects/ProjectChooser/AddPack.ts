import { InformedChoiceWindow } from '/@/components/Windows/InformedChoice/InformedChoice'
import { App } from '/@/App'
import { CreateBP } from '../CreateProject/Packs/BP'
import { CreateProjectWindow } from '../CreateProject/CreateProject'
import { CreateRP } from '../CreateProject/Packs/RP'
import { CreateSP } from '../CreateProject/Packs/SP'
import { CreateWT } from '../CreateProject/Packs/WT'
import { defaultPackPaths } from '../Project/Config'

export async function addPack() {
	const app = await App.getApp()
	const window = new InformedChoiceWindow('windows.projectChooser.addPack')
	const actionManager = await window.actionManager

	const createdPacks = app.project.getPacks()

	const createablePacks = App.packType.all.filter(
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

				switch (packType.id) {
					case 'behaviorPack': {
						await new CreateBP().create(scopedFs, defaultOptions)
						break
					}
					case 'resourcePack': {
						await new CreateRP().create(scopedFs, defaultOptions)
						break
					}
					case 'skinPack': {
						await new CreateSP().create(scopedFs, defaultOptions)
						break
					}
					case 'worldTemplate': {
						await new CreateWT().create(scopedFs, defaultOptions)
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
							[packType.id]: defaultPackPaths[packType.id],
						},
					},
					true
				)

				app.project.addPack({
					...packType,
					packPath: app.project.config.resolvePackPath(packType.id),
					version: [1, 0, 0],
				})

				app.project.updateChangedFiles()
				App.eventSystem.dispatch('projectChanged', app.project)

				app.windows.loadingWindow.close()
			},
		})
	)

	window.open()
}
