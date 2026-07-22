import { ProjectManager } from '@/libs/project/ProjectManager'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { zipDirectory } from '@/libs/zip/ZipDirectory'
import { join } from 'pathe'
import { addGeneratedWith, incrementManifestVersions, saveOrDownload } from '../Export'
import { DashService } from '@/libs/compiler/DashService'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { Settings } from '@/libs/settings/Settings'
import { ReportErrorWindow } from '@/components/Windows/ReportError/ReportErrorWindow'

export async function exportAsMcAddon() {
	if (!ProjectManager.currentProject) return
	if (!(ProjectManager.currentProject instanceof BedrockProject)) return

	if (Settings.get('incrementVersionOnExport')) await incrementManifestVersions()
	if (Settings.get('addGeneratedWith')) await addGeneratedWith()

	const dash = new DashService(ProjectManager.currentProject, fileSystem)

	try {
		await dash.setup('production')
		await dash.build()

		const zipFile = await zipDirectory(fileSystem, join(ProjectManager.currentProject.path, 'builds/dist'))
		const savePath = join(ProjectManager.currentProject.path, 'builds/', ProjectManager.currentProject.name) + '.mcaddon'

		await saveOrDownload(savePath, zipFile, fileSystem)
	} catch (err) {
		console.error(err)

		ReportErrorWindow.openErrorWindow(err instanceof Error ? err : new Error(String(err)))
	} finally {
		await dash.dispose()
	}
}
