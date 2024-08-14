import { join } from 'pathe'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { zipDirectory } from '@/libs/zip/ZipDirectory'
import { saveOrDownload } from './Export'

export async function exportAsBrProject() {
	if (!ProjectManager.currentProject) return

	const savePath =
		join(ProjectManager.currentProject.path, 'builds/', ProjectManager.currentProject.name) + '.brproject'

	const zipFile = await zipDirectory(fileSystem, ProjectManager.currentProject.path, new Set(['builds']))

	try {
		await saveOrDownload(savePath, zipFile, fileSystem)
	} catch (err) {
		console.error(err)
	}
}
