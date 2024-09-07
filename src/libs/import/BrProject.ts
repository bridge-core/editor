import { fileSystem, selectOrLoadBridgeFolder } from '@/libs/fileSystem/FileSystem'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { streamingUnzip } from '@/libs/zip/StreamingUnzipper'
import { basename, join } from 'pathe'
import { ProjectManager } from '@/libs/project/ProjectManager'

export async function importFromBrProject(arrayBuffer: ArrayBuffer, name: string) {
	if (fileSystem instanceof PWAFileSystem && !fileSystem.setup) await selectOrLoadBridgeFolder()

	console.time('[IMPORT] .brproject')

	const buffer = new Uint8Array(arrayBuffer)

	const targetPath = join('/projects', name)
	const projectPath = await fileSystem.findSuitableFolderName(targetPath)
	const projectName = basename(projectPath)

	await streamingUnzip(buffer, async (file) => {
		const path = join(projectPath, file.name)

		await fileSystem.ensureDirectory(path)

		await fileSystem.writeFileStreaming(path, file)
	})

	await ProjectManager.closeProject()
	await ProjectManager.loadProjects()
	await ProjectManager.loadProject(projectName)

	console.timeEnd('[IMPORT] .brproject')
}
