import { App } from '/@/App'
import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { Unzipper } from '/@/components/FileSystem/Zip/Unzipper'
import { InitialSetup } from '/@/components/InitialSetup/InitialSetup'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { exportAsBrproject } from '../Export/AsBrproject'
import { TPackTypeId } from '/@/components/Data/PackType'
import { CreateProjectWindow } from '../CreateProject/CreateProject'
import { getLatestFormatVersion } from '/@/components/Data/FormatVersions'
import { CreateConfig } from '../CreateProject/Files/Config'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { defaultPackPaths } from '../Project/Config'
import { InformationWindow } from '../../Windows/Common/Information/InformationWindow'

export async function importFromMcaddon(
	fileHandle: AnyFileHandle,
	isFirstImport = false,
	unzip = true
) {
	const app = await App.getApp()
	const fs = app.fileSystem
	const tmpHandle = await fs.getDirectoryHandle('import', {
		create: true,
	})

	if (!isFirstImport) await app.projectManager.projectReady.fired

	// Unzip .mcaddon file
	if (unzip) {
		const unzipper = new Unzipper(tmpHandle)
		const file = await fileHandle.getFile()
		const data = new Uint8Array(await file.arrayBuffer())
		unzipper.createTask(app.taskManager)
		await unzipper.unzip(data)
	}
	const projectName = fileHandle.name
		.replace('.mcaddon', '')
		.replace('.zip', '')

	// Ask user whether he wants to save the current project if we are going to delete it later in the import process
	if (isUsingFileSystemPolyfill.value && !isFirstImport) {
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
	for await (const pack of tmpHandle.values()) {
		if (
			pack.kind === 'directory' &&
			(await fs.fileExists(`import/${pack.name}/manifest.json`))
		) {
			const manifest = await fs.readJSON(
				`import/${pack.name}/manifest.json`
			)
			const modules = <IManifestModule[]>manifest?.modules ?? []
			if (!authors) authors = manifest?.metadata?.authors
			if (!description) description = manifest?.header?.description

			const packId = getPackId(modules)
			if (!packId) return

			packs.push(packId)
			const packPath = defaultPackPaths[packId]
			// Move the pack to the correct location
			await fs.move(
				`import/${pack.name}`,
				`projects/${projectName}/${packPath}`
			)
		}
		// TODO: Support unpacking .mcpack files
	}
	if (packs.length === 1)
		new InformationWindow({
			description: 'fileDropper.mcaddon.missingManifests',
		})

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

	// Get current project name
	let currentProjectName: string | undefined
	if (!isFirstImport) currentProjectName = app.project.name

	// Add new project
	if (InitialSetup.ready.hasFired) {
		await app.projectManager.addProject(
			await fs.getDirectoryHandle(`projects/${projectName}`),
			true
		)
	}

	// Remove old project if browser is using fileSystem polyfill
	if (isUsingFileSystemPolyfill.value && !isFirstImport)
		await app.projectManager.removeProject(currentProjectName!)

	await fs.unlink('import')
}

interface IManifestModule {
	type: 'data' | 'resources' | 'skin_pack' | 'world_template'
}

function getPackId(modules: IManifestModule[]): TPackTypeId | undefined {
	for (const { type } of modules) {
		switch (type) {
			case 'data':
				return 'behaviorPack'
			case 'resources':
				return 'resourcePack'
			case 'skin_pack':
				return 'skinPack'
			case 'world_template':
				return 'worldTemplate'
		}
	}
}
