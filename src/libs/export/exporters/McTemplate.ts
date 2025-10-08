import { ProjectManager } from '@/libs/project/ProjectManager'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { zipDirectory } from '@/libs/zip/ZipDirectory'
import { join } from 'pathe'
import { incrementManifestVersions, saveOrDownload } from '../Export'
import { DashService } from '@/libs/compiler/DashService'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { v4 as uuid } from 'uuid'
import { Data } from '@/libs/data/Data'
import { Windows } from '@/components/Windows/Windows'
import { DropdownWindow } from '@/components/Windows/Dropdown/DropdownWindow'
import { Settings } from '@/libs/settings/Settings'

export async function exportAsTemplate(asMcworld = false) {
	if (!ProjectManager.currentProject) return
	if (!(ProjectManager.currentProject instanceof BedrockProject)) return

	if (Settings.get('incrementVersionOnExport')) await incrementManifestVersions()

	const projectPath = ProjectManager.currentProject.path

	const dash = new DashService(ProjectManager.currentProject, fileSystem)
	await dash.setup('production')
	await dash.build()
	await dash.dispose()

	let baseWorlds: string[] = []

	if (ProjectManager.currentProject.packs['worldTemplate']) baseWorlds.push('WT')

	if (await fileSystem.exists(join(projectPath, 'worlds')))
		baseWorlds.push(...(await fileSystem.readDirectoryEntries(join(projectPath, 'worlds'))).map((entry) => entry.path))

	let exportWorldFolder: string | null

	// No world to package
	if (baseWorlds.length === 0) {
		console.warn('No worlds to package!')

		return
	} else if (baseWorlds.length === 1) {
		exportWorldFolder = baseWorlds[0]
	} else {
		exportWorldFolder = await new Promise((res) => {
			Windows.open(
				new DropdownWindow(
					'packExplorer.exportAsMctemplate.chooseWorld',
					'',
					baseWorlds,
					(value) => {
						res(value)
					},
					() => {
						res(null)
					},
					baseWorlds[0]
				)
			)
		})
	}

	if (exportWorldFolder === null) return

	await fileSystem.ensureDirectory(join(projectPath, `builds/mctemplate/behavior_packs`))
	await fileSystem.ensureDirectory(join(projectPath, `builds/mctemplate/resource_packs`))

	// Find out BP, RP & WT folders
	const packs = (await fileSystem.readDirectoryEntries(join(projectPath, `builds/dist`))).map((entry) => entry.path)

	const packLocations = <{ [pack in 'WT' | 'BP' | 'RP']: string | undefined }>{
		BP: packs.find((pack) => pack.endsWith('BP')),
		RP: packs.find((pack) => pack.endsWith('RP')),
		WT: packs.find((pack) => pack.endsWith('WT')),
	}

	// Copy world folder into builds/mctemplate
	if (exportWorldFolder === 'WT') {
		await fileSystem.move(packLocations.WT!, join(ProjectManager.currentProject!.path, `builds/mctemplate`))
	} else {
		await fileSystem.copyDirectory(exportWorldFolder, join(ProjectManager.currentProject!.path, `builds/mctemplate`))
	}

	// Generate world_behavior_packs.json
	if (packLocations.BP) {
		const bpManifest = await fileSystem.readFileJson(`${packLocations.BP}/manifest.json`).catch(() => null)

		if (bpManifest !== null && bpManifest?.header?.uuid && bpManifest?.header?.version) {
			await fileSystem.writeFileJson(
				join(projectPath, 'builds/mctemplate/world_behavior_packs.json'),
				[
					{
						pack_id: bpManifest.header.uuid,
						version: bpManifest.header.version,
					},
				],
				true
			)
		}
	}

	// Generate world_resource_packs.json
	if (packLocations.RP) {
		const rpManifest = await fileSystem.readFileJson(`${packLocations.RP}/manifest.json`).catch(() => null)

		if (rpManifest !== null && rpManifest?.header?.uuid && rpManifest?.header?.version) {
			await fileSystem.writeFileJson(
				join(projectPath, 'builds/mctemplate/world_resource_packs.json'),
				[
					{
						pack_id: rpManifest.header.uuid,
						version: rpManifest.header.version,
					},
				],
				true
			)
		}
	}

	// Move BP & RP into behavior_packs/resource_packs
	if (packLocations.BP) {
		await fileSystem.ensureDirectory(join(projectPath, `builds/mctemplate/behavior_packs/BP_${ProjectManager.currentProject.name}`))

		await fileSystem.move(
			packLocations.BP,
			join(projectPath, `builds/mctemplate/behavior_packs/BP_${ProjectManager.currentProject.name}`)
		)
	}

	if (packLocations.RP) {
		await fileSystem.ensureDirectory(join(projectPath, `builds/mctemplate/resource_packs/RP_${ProjectManager.currentProject.name}`))

		await fileSystem.move(
			packLocations.RP,
			join(projectPath, `builds/mctemplate/resource_packs/RP_${ProjectManager.currentProject.name}`)
		)
	}

	// Generate world template manifest if file doesn't exist yet
	if (!(await fileSystem.exists(join(projectPath, 'builds/mctemplate/manifest.json'))) && !asMcworld) {
		await fileSystem.writeFileJson(
			join(projectPath, 'builds/mctemplate/manifest.json'),
			{
				format_version: 2,
				header: {
					name: 'pack.name',
					description: 'pack.description',
					version: [1, 0, 0],
					uuid: uuid(),
					lock_template_options: true,
					base_game_version: (
						ProjectManager.currentProject.config!.targetVersion ??
						(
							await Data.get('packages/minecraftBedrock/formatVersions.json')
						)[0]
					)
						.split('.')
						.map((str) => Number(str)),
				},
				modules: [
					{
						type: 'world_template',
						version: [1, 0, 0],
						uuid: uuid(),
					},
				],
			},
			true
		)
	} else if (asMcworld && exportWorldFolder === 'WT') {
		await fileSystem.removeFile(join(projectPath, 'builds/mctemplate/manifest.json'))
	}

	// ZIP builds/mctemplate folder
	const zipFile = await zipDirectory(fileSystem, join(ProjectManager.currentProject.path, 'builds/mctemplate'))
	const savePath =
		join(ProjectManager.currentProject.path, 'builds/', ProjectManager.currentProject.name) + (asMcworld ? '.mcworld' : '.mctemplate')

	try {
		await saveOrDownload(savePath, zipFile, fileSystem)
	} catch (err) {
		console.error(err)
	}

	// Delete builds/mctemplate folder
	await fileSystem.removeDirectory(join(projectPath, `builds/mctemplate`))
}
