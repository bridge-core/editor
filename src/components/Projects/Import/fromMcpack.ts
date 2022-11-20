import { App } from '/@/App'
import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { StreamingUnzipper } from '/@/components/FileSystem/Zip/StreamingUnzipper'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { exportAsBrproject } from '../Export/AsBrproject'
import { TPackTypeId } from '/@/components/Data/PackType'
import { CreateProjectWindow } from '../CreateProject/CreateProject'
import { getLatestFormatVersion } from '/@/components/Data/FormatVersions'
import { CreateConfig } from '../CreateProject/Files/Config'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { defaultPackPaths } from '../Project/Config'
import { InformationWindow } from '../../Windows/Common/Information/InformationWindow'
import { getPackId, IManifestModule } from '/@/utils/manifest/getPackId'
import { findSuitableFolderName } from '/@/utils/directory/findSuitableName'

export async function importFromMcpack(
	fileHandle: AnyFileHandle,
	unzip = true
) {
	const app = await App.getApp()
	const fs = app.fileSystem
	const tmpHandle = await fs.getDirectoryHandle('import', {
		create: true,
	})

	await app.projectManager.projectReady.fired

	// Unzip .mcpack file
	if (unzip) {
		const unzipper = new StreamingUnzipper(tmpHandle)
		const file = await fileHandle.getFile()
		const data = new Uint8Array(await file.arrayBuffer())
		unzipper.createTask(app.taskManager)
		await unzipper.unzip(data)
	}
	// Make sure that we don't replace an existing project
	const projectName = await findSuitableFolderName(
		fileHandle.name.replace('.mcpack', '').replace('.zip', ''),
		await fs.getDirectoryHandle('projects')
	)

	// Ask user whether they want to save the current project if we are going to delete it later in the import process
	if (isUsingFileSystemPolyfill.value && !app.hasNoProjects) {
		const confirmWindow = new ConfirmationWindow({
			description:
				'windows.projectChooser.openNewProject.saveCurrentProject',
			cancelText: 'general.no',
			confirmText: 'general.yes',
		})
		if (await confirmWindow.fired) {
			await exportAsBrproject()
		}
	}

	let authors: string[] | string | undefined
	let description: string | undefined
	const packs: (TPackTypeId | '.bridge')[] = ['.bridge']

	// 1. Process pack
	if (await fs.fileExists(`import/manifest.json`)) {
		const manifest = await fs.readJSON(`import/manifest.json`)
		const modules = <IManifestModule[]>manifest?.modules ?? []
		if (!authors) authors = manifest?.metadata?.authors
		if (!description) description = manifest?.header?.description

		const packId = getPackId(modules)
		if (!packId) return

		packs.push(packId)
		const packPath = defaultPackPaths[packId]
		// Move the pack to the correct location
		await fs.move(`import`, `projects/${projectName}/${packPath}`)
	} else {
		new InformationWindow({
			description: 'fileDropper.mcaddon.missingManifests',
		})
	}

	const defaultOptions = CreateProjectWindow.getDefaultOptions()
	defaultOptions.name = projectName
	defaultOptions.author = authors ?? ['Unknown']
	defaultOptions.description = description ?? ''
	defaultOptions.packs = packs
	defaultOptions.targetVersion = await getLatestFormatVersion()
	await new CreateConfig().create(
		new FileSystem(
			await fs.getDirectoryHandle(`projects/${projectName}`, {
				create: true,
			})
		),
		defaultOptions
	)

	await fs.mkdir(`projects/${projectName}/.bridge/extensions`)
	await fs.mkdir(`projects/${projectName}/.bridge/compiler`)

	if (isUsingFileSystemPolyfill.value && !app.hasNoProjects)
		// Remove old project if browser is using fileSystem polyfill
		await app.projectManager.removeProject(app.project)

	// Add new project
	await app.projectManager.addProject(
		await fs.getDirectoryHandle(`projects/${projectName}`),
		true
	)

	await fs.unlink('import')
}
