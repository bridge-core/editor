import { ConfirmWindow } from '@/components/Windows/Confirm/ConfirmWindow'
import { Windows } from '@/components/Windows/Windows'
import { TPackTypeId } from 'mc-project-core'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { Settings } from '@/libs/settings/Settings'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { Data } from '@/libs/data/Data'
import { join } from 'pathe'
import { packs } from './Packs'
import { ProjectManager } from './ProjectManager'
import { getLatestStableFormatVersion } from '@/libs/data/bedrock/FormatVersion'
import { v4 as uuid } from 'uuid'

export interface ConvertableComMojangProjectInfo {
	type: 'com.mojang'
	packs: { type: TPackTypeId; uuid: string; path: string; relatedPacks: string[] }[]
	name: string
	icon: string
}

export interface ConvertableV1ProjectInfo {
	type: 'v1'
	packs: { type: TPackTypeId; uuid: string; path: string; relatedPacks: string[] }[]
	name: string
	icon: string
}

export type ConvertableProjectInfo = ConvertableComMojangProjectInfo | ConvertableV1ProjectInfo

export function convertProject(projectInfo: ConvertableProjectInfo) {
	Windows.open(
		new ConfirmWindow(`convert.confirmationMessage.${projectInfo.type}`, async () => {
			if (fileSystem instanceof PWAFileSystem) {
				const outputFolder: FileSystemDirectoryHandle | undefined = Settings.get('outputFolder')

				if (!outputFolder) return

				const comMojangFileSystem = new PWAFileSystem(false)
				comMojangFileSystem.setBaseHandle(outputFolder)

				if (outputFolder && (await comMojangFileSystem.ensurePermissions(outputFolder))) {
					if (projectInfo.type === 'v1') convertV1Project(projectInfo, comMojangFileSystem)
					if (projectInfo.type === 'com.mojang') convertComMojangProject(projectInfo, comMojangFileSystem)
				}
			}
		})
	)
}

async function convertComMojangProject(convertableProjectInfo: ConvertableComMojangProjectInfo, comMojangFileSystem: BaseFileSystem) {
	const packDefinitions: { id: string; defaultPackPath: string }[] = await Data.get('packages/minecraftBedrock/packDefinitions.json')
	packDefinitions.push({
		id: 'bridge',
		defaultPackPath: '.bridge',
	})

	const projectPath = join('projects', convertableProjectInfo.name)

	await fileSystem.makeDirectory(projectPath)

	let manifest = null

	for (const pack of convertableProjectInfo.packs) {
		try {
			manifest = await comMojangFileSystem.readFileJson(join(pack.path, 'manifest.json'))
		} catch {}
	}

	const experimentalToggles = await Data.get('packages/minecraftBedrock/experimentalGameplay.json')

	packs['bridge']!.create(
		fileSystem,
		projectPath,
		{
			author: (manifest?.metadata?.authors as string[] | undefined) ?? ['bridge'],
			bpAsRpDependency:
				convertableProjectInfo.packs.some((pack) => pack.type === 'behaviorPack') &&
				convertableProjectInfo.packs.some((pack) => pack.type === 'resourcePack'),
			rpAsBpDependency:
				convertableProjectInfo.packs.some((pack) => pack.type === 'behaviorPack') &&
				convertableProjectInfo.packs.some((pack) => pack.type === 'resourcePack'),
			configurableFiles: [],
			description: manifest?.header?.description ?? '',
			icon: convertableProjectInfo.icon,
			name: convertableProjectInfo.name,
			namespace: 'bridge',
			targetVersion: await getLatestStableFormatVersion(),
			packs: ['bridge', ...convertableProjectInfo.packs.map((pack) => pack.type)],
			uuids: Object.fromEntries(convertableProjectInfo.packs.map((packType) => [packType.type, uuid()])),
			experiments: Object.fromEntries(experimentalToggles.map((toggle: any) => [toggle.id, false])),
		},
		join(projectPath, packDefinitions.find((pack) => pack.id === 'bridge')!.defaultPackPath)
	)

	for (const pack of convertableProjectInfo.packs) {
		const packDefinition = packDefinitions.find((packDefinition) => packDefinition.id === pack.type)

		if (!packDefinition) {
			console.warn(`Failed to convert pack of type ${pack.type}. Could not find matching pack definition.`)

			continue
		}

		await fileSystem.copyDirectoryFromFileSystem(pack.path, comMojangFileSystem, join(projectPath, packDefinition.defaultPackPath))
	}

	const projectInfo = await ProjectManager.getProjectInfo(projectPath)

	if (!projectInfo) throw new Error('Failed to create project!')

	for (const pack of convertableProjectInfo.packs) {
		await comMojangFileSystem.removeDirectory(pack.path)
	}

	ProjectManager.convertableProjects.splice(
		ProjectManager.convertableProjects.findIndex((project) => project.packs[0].uuid === convertableProjectInfo.packs[0].uuid)
	)
	ProjectManager.updatedConvertableProjects.dispatch()

	ProjectManager.addProject(projectInfo)
}

async function convertV1Project(convertableProjectInfo: ConvertableV1ProjectInfo, comMojangFileSystem: BaseFileSystem) {
	const packDefinitions: { id: string; defaultPackPath: string }[] = await Data.get('packages/minecraftBedrock/packDefinitions.json')
	packDefinitions.push({
		id: 'bridge',
		defaultPackPath: '.bridge',
	})

	const projectPath = join('projects', convertableProjectInfo.name)

	await fileSystem.makeDirectory(projectPath)

	let manifest = null

	for (const pack of convertableProjectInfo.packs) {
		try {
			manifest = await comMojangFileSystem.readFileJson(join(pack.path, 'manifest.json'))
		} catch {}
	}

	let config = null

	for (const pack of convertableProjectInfo.packs) {
		try {
			config = await comMojangFileSystem.readFileJson(join(pack.path, 'bridge', 'config.json'))
		} catch {}
	}

	const experimentalToggles = await Data.get('packages/minecraftBedrock/experimentalGameplay.json')

	packs['bridge']!.create(
		fileSystem,
		projectPath,
		{
			author: (manifest?.metadata?.authors as string[] | undefined) ?? ['bridge'],
			bpAsRpDependency:
				convertableProjectInfo.packs.some((pack) => pack.type === 'behaviorPack') &&
				convertableProjectInfo.packs.some((pack) => pack.type === 'resourcePack'),
			rpAsBpDependency:
				convertableProjectInfo.packs.some((pack) => pack.type === 'behaviorPack') &&
				convertableProjectInfo.packs.some((pack) => pack.type === 'resourcePack'),
			configurableFiles: [],
			description: manifest?.header?.description ?? '',
			icon: convertableProjectInfo.icon,
			name: convertableProjectInfo.name,
			namespace: config?.prefix ?? 'bridge',
			targetVersion: config?.formatVersion ?? (await getLatestStableFormatVersion()),
			packs: ['bridge', ...convertableProjectInfo.packs.map((pack) => pack.type)],
			uuids: Object.fromEntries(convertableProjectInfo.packs.map((packType) => [packType.type, uuid()])),
			experiments: Object.fromEntries(experimentalToggles.map((toggle: any) => [toggle.id, false])),
		},
		join(projectPath, packDefinitions.find((pack) => pack.id === 'bridge')!.defaultPackPath)
	)

	for (const pack of convertableProjectInfo.packs) {
		const packDefinition = packDefinitions.find((packDefinition) => packDefinition.id === pack.type)

		if (!packDefinition) {
			console.warn(`Failed to convert pack of type ${pack.type}. Could not find matching pack definition.`)

			continue
		}

		await fileSystem.copyDirectoryFromFileSystem(pack.path, comMojangFileSystem, join(projectPath, packDefinition.defaultPackPath))
	}

	const projectInfo = await ProjectManager.getProjectInfo(projectPath)

	if (!projectInfo) throw new Error('Failed to create project!')

	for (const pack of convertableProjectInfo.packs) {
		await comMojangFileSystem.removeDirectory(pack.path)
	}

	ProjectManager.convertableProjects.splice(
		ProjectManager.convertableProjects.findIndex((project) => project.packs[0].uuid === convertableProjectInfo.packs[0].uuid)
	)
	ProjectManager.updatedConvertableProjects.dispatch()

	ProjectManager.addProject(projectInfo)
}
