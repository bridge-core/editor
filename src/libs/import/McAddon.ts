import { fileSystem, selectOrLoadBridgeFolder } from '@/libs/fileSystem/FileSystem'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { streamingUnzip } from '@/libs/zip/StreamingUnzipper'
import { basename, join } from 'pathe'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { TPackTypeId } from 'mc-project-core'
import { Windows } from '@/components/Windows/Windows'
import { AlertWindow } from '@/components/Windows/Alert/AlertWindow'
import { getPackId, IManifestModule } from '@/libs/manifest/getPackId'
import { CreateProjectConfig } from '@/libs/project/CreateProjectConfig'
import { getLatestStableFormatVersion } from '@/libs/data/bedrock/FormatVersion'
import { createConfig } from '@/libs/project/create/files/Config'
import { FileImporter } from './FileImporter'
import { Data } from '@/libs/data/Data'
import { BaseEntry } from '@/libs/fileSystem/BaseFileSystem'

export async function importFromMcAddon(entry: BaseEntry) {
	if (fileSystem instanceof PWAFileSystem && !fileSystem.setup) await selectOrLoadBridgeFolder()

	console.time('[Import] .mcaddon')

	const buffer = new Uint8Array(await entry.read())

	const targetPath = join('/projects', name)
	const projectPath = await fileSystem.findSuitableFolderName(targetPath)
	const projectName = basename(projectPath)

	await fileSystem.makeDirectory(`/projects/${projectName}`)
	await fileSystem.makeDirectory(`/projects/${projectName}/.bridge`)
	await fileSystem.makeDirectory(`projects/${projectName}/.bridge/extensions`)
	await fileSystem.makeDirectory(`projects/${projectName}/.bridge/compiler`)

	if (await fileSystem.exists('/import')) await fileSystem.removeDirectory('/import')

	await fileSystem.makeDirectory('/import')

	await streamingUnzip(buffer, async (file) => {
		const path = join('/import', file.name)

		await fileSystem.ensureDirectory(path)

		await fileSystem.writeFileStreaming(path, file)
	})

	const packDefinitions = await Data.get('packages/minecraftBedrock/packDefinitions.json')

	let authors: string[] | string | undefined
	let description: string | undefined
	const packs: (TPackTypeId | '.bridge')[] = ['.bridge']

	for (const entry of await fileSystem.readDirectoryEntries('/import')) {
		if (entry.kind === 'directory' && (await fileSystem.exists(`/import/${basename(entry.path)}/manifest.json`))) {
			const manifest = await fileSystem.readFileJson(`/import/${basename(entry.path)}/manifest.json`)
			const modules = <IManifestModule[]>manifest?.modules ?? []

			if (!authors) authors = manifest?.metadata?.authors
			if (!description) description = manifest?.header?.description

			const packId = getPackId(modules)
			if (!packId) return

			packs.push(packId)
			const packPath = packDefinitions.find((packDefinition: any) => packDefinition.id === packId).defaultPackPath

			// Move the pack to the correct location
			await fileSystem.move(`/import/${basename(entry.path)}`, join('/projects', projectName, packPath))
		}
	}

	// NOTE: For some reason this causes an error. So we'll just not remove it
	// await fileSystem.removeDirectory('/import')

	if (packs.length === 1) Windows.open(new AlertWindow('fileDropper.mcaddon.missingManifests'))

	const createProjectConfig: CreateProjectConfig = {
		name: projectName,
		description: description ?? '',
		namespace: 'bridge',
		author: authors ?? ['Unknown'],
		targetVersion: await getLatestStableFormatVersion(),
		icon: '',
		packs: packs,
		configurableFiles: [],
		rpAsBpDependency: false,
		bpAsRpDependency: false,
		uuids: {},
		experiments: {},
	}

	await createConfig(fileSystem, join(projectPath, 'config.json'), createProjectConfig)

	await ProjectManager.closeProject()
	await ProjectManager.loadProjects()
	await ProjectManager.loadProject(projectName)

	console.timeEnd('[Import] .mcaddon')
}

export class AddonFileImporter extends FileImporter {
	public constructor() {
		super(['.mcaddon'])
	}

	public async onImport(entry: BaseEntry) {
		await importFromMcAddon(entry)
	}
}
