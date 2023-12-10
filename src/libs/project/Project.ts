import { basename, join } from '@/libs/path'
import { confirmWindow, fileSystem, sidebar } from '@/App'
import { defaultPackPaths, IConfigJson } from 'mc-project-core'
import { ProjectData } from '@/libs/data/ProjectData'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { get, set } from 'idb-keyval'
import { EventSystem } from '@/libs/event/EventSystem'
import { LocalFileSystem } from '../fileSystem/LocalFileSystem'

export interface ProjectInfo {
	name: string
	icon: string
	config: IConfigJson
}

export class Project {
	public path: string
	public icon: string | null = null
	public packs: string[] = []
	public outputFileSystem: BaseFileSystem = new LocalFileSystem()
	public eventSystem = new EventSystem(['outputFileSystemChanged'])

	constructor(public name: string, public data: ProjectData) {
		this.path = join('projects', this.name)

		if (!(this.outputFileSystem instanceof LocalFileSystem)) return

		this.outputFileSystem.setRootName(this.name)
	}

	public async load() {
		const projectInfo = await getProjectInfo(join('projects', this.name))

		this.icon = projectInfo.icon
		this.packs = Object.keys(projectInfo.config.packs)

		await this.data.load()

		await this.loadBetterOutputFileSystemOrAsk()
	}

	public async dispose() {}

	// Should probably break this into something more managable at some point
	private async loadBetterOutputFileSystemOrAsk() {
		const savedHandle: undefined | FileSystemDirectoryHandle = await get(
			`projectOutputFolderHandle-${this.name}`
		)

		const newOutputFileSystem = new PWAFileSystem()

		if (
			savedHandle &&
			(await newOutputFileSystem.ensurePermissions(savedHandle))
		) {
			newOutputFileSystem.setBaseHandle(savedHandle)

			await this.setNewOutputFileSystem(newOutputFileSystem)
		} else {
			sidebar.addNotification(
				'warning',
				() => {
					confirmWindow.open(
						'You have not set up your output folder yet. Do you want to set it up now?',
						async () => {
							try {
								newOutputFileSystem.setBaseHandle(
									(await window.showDirectoryPicker({
										mode: 'readwrite',
									})) ?? null
								)

								set(
									`projectOutputFolderHandle-${this.name}`,
									newOutputFileSystem.baseHandle
								)

								await this.setNewOutputFileSystem(
									newOutputFileSystem
								)
							} catch {}
						}
					)
				},
				'warning'
			)
		}
	}

	public async setNewOutputFileSystem(fileSystem: BaseFileSystem) {
		this.outputFileSystem = fileSystem

		this.eventSystem.dispatch('outputFileSystemChanged', undefined)
	}
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
