import { basename, join } from '@/libs/path'
import { confirmWindow, fileSystem, sidebar } from '@/App'
import { defaultPackPaths, IConfigJson } from 'mc-project-core'
import { ProjectData } from '@/libs/data/ProjectData'
import { BaseFileSystem } from '../fileSystem/BaseFileSystem'
import { getFileSystem } from '../fileSystem/FileSystem'
import { PWAFileSystem } from '../fileSystem/PWAFileSystem'
import { get, set } from 'idb-keyval'

export interface ProjectInfo {
	name: string
	icon: string
	config: IConfigJson
}

export class Project {
	public path: string
	public icon: string | null = null
	public packs: string[] = []
	public outputFileSystem: BaseFileSystem = getFileSystem()

	constructor(public name: string, public data: ProjectData) {
		this.path = join('projects', this.name)
	}

	public async load() {
		const projectInfo = await getProjectInfo(join('projects', this.name))

		this.icon = projectInfo.icon
		this.packs = Object.keys(projectInfo.config.packs)

		await this.data.load()

		if (this.outputFileSystem instanceof PWAFileSystem) {
			const savedHandle: undefined | FileSystemDirectoryHandle =
				await get(`projectOutputFolderHandle-${this.name}`)

			console.log(savedHandle)

			if (
				!this.outputFileSystem.baseHandle &&
				savedHandle &&
				(await this.outputFileSystem.ensurePermissions(savedHandle))
			) {
				this.outputFileSystem.setBaseHandle(savedHandle)
			} else {
				sidebar.addNotification(
					'warning',
					() => {
						confirmWindow.open(
							'You have not set up your output folder yet. Do you want to set it up now?',
							async () => {
								try {
									if (
										!(
											this.outputFileSystem instanceof
											PWAFileSystem
										)
									)
										return

									this.outputFileSystem.setBaseHandle(
										(await window.showDirectoryPicker({
											mode: 'readwrite',
										})) ?? null
									)

									set(
										`projectOutputFolderHandle-${this.name}`,
										this.outputFileSystem.baseHandle
									)
								} catch {}
							}
						)
					},
					'warning'
				)
			}
		}
	}

	public async dispose() {}
}

export async function validProject(path: string) {
	return await fileSystem.exists(join(path, 'config.json'))
}

export async function getProjectInfo(path: string): Promise<ProjectInfo> {
	let iconDataUrl =
		'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

	if (
		await fileSystem.exists(
			join(path, defaultPackPaths['behaviorPack'], 'pack_icon.png')
		)
	)
		iconDataUrl = await fileSystem.readFileDataUrl(
			join(path, 'BP', 'pack_icon.png')
		)

	if (
		await fileSystem.exists(
			join(path, defaultPackPaths['resourcePack'], 'pack_icon.png')
		)
	)
		iconDataUrl = await fileSystem.readFileDataUrl(
			join(path, 'BP', 'pack_icon.png')
		)

	if (
		await fileSystem.exists(
			join(path, defaultPackPaths['skinPack'], 'pack_icon.png')
		)
	)
		iconDataUrl = await fileSystem.readFileDataUrl(
			join(path, 'BP', 'pack_icon.png')
		)

	return {
		name: basename(path),
		icon: iconDataUrl,
		config: await fileSystem.readFileJson(join(path, 'config.json')),
	}
}
