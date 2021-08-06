import { DropdownWindow } from '/@/components/Windows/Common/Dropdown/DropdownWindow'
import { App } from '/@/App'

export async function exportAsMctemplate() {
	const app = await App.getApp()
	const project = app.project
	const fs = project.fileSystem
	app.windows.loadingWindow.open()

	await app.project.compilerManager.start('default.json', 'build')

	let baseWorlds: string[] = []

	if (project.hasPacks(['worldTemplate'])) baseWorlds.push('WT')
	if (await fs.directoryExists('worlds'))
		baseWorlds.push(
			...(await fs.readdir('worlds')).map((world) => `worlds/${world}`)
		)

	let exportWorldFolder: string
	// No world to package
	if (baseWorlds.length === 0) {
		app.windows.loadingWindow.close()
		return
	} else if (baseWorlds.length === 1) {
		exportWorldFolder = baseWorlds[0]
	} else {
		const optionsWindow = new DropdownWindow({
			default: baseWorlds[0],
			name: 'windows.packExplorer.exportAsMctemplate.chooseWorld',
			options: baseWorlds,
		})

		exportWorldFolder = await optionsWindow.fired
	}
	console.log(exportWorldFolder)

	await fs.mkdir(`builds/mctemplate/behavior_packs`, {
		recursive: true,
	})
	await fs.mkdir(`builds/mctemplate/resource_packs`, {
		recursive: true,
	})
	// TODO: Move BP & RP into behavior_packs/resource_packs

	// TODO: generate world_behavior_packs.json & world_resource_packs.json

	// TODO: ZIP builds/mctemplate folder

	// TODO: delete builds/mctemplate folder

	await project.app.windows.loadingWindow.close()
}

export async function canExportMctemplate() {
	const app = await App.getApp()
	return (
		app.project.hasPacks(['worldTemplate']) ||
		((await app.project.fileSystem.directoryExists('worlds')) &&
			(await app.project.fileSystem.readdir('worlds')).length > 0)
	)
}
