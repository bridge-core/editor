import { ProjectManager } from '@/libs/project/ProjectManager'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { zipDirectory } from '@/libs/zip/ZipDirectory'
import { join } from 'pathe'
import { incrementManifestVersions, saveOrDownload } from '../Export'
import { DashService } from '@/libs/compiler/DashService'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { Settings } from '@/libs/settings/Settings'

export async function exportAsMcAddon() {
	if (!ProjectManager.currentProject) return
	if (!(ProjectManager.currentProject instanceof BedrockProject)) return

	if (Settings.get('incrementVersionOnExport')) await incrementManifestVersions()

	const dash = new DashService(ProjectManager.currentProject, fileSystem)
	await dash.setup('production')
	await dash.build()
	await dash.dispose()

	const zipFile = await zipDirectory(fileSystem, join(ProjectManager.currentProject.path, 'builds/dist'))
	const savePath = join(ProjectManager.currentProject.path, 'builds/', ProjectManager.currentProject.name) + '.mcaddon'

	try {
		await saveOrDownload(savePath, zipFile, fileSystem)
	} catch (err) {
		console.error(err)
	}
}
