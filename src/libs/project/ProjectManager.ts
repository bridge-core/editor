import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { Project } from './Project'
import { basename, join } from 'pathe'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { CreateProjectConfig } from './CreateProjectConfig'
import { Ref, onMounted, onUnmounted, ref, watch } from 'vue'
import { BedrockProject } from './BedrockProject'
import { IConfigJson, TPackTypeId } from 'mc-project-core'
import { LocalFileSystem } from '@/libs/fileSystem/LocalFileSystem'
import { Data } from '@/libs/data/Data'
import { Settings } from '@/libs/settings/Settings'
import { get, set } from 'idb-keyval'
import { Event } from '@/libs/event/Event'
import { Disposable } from '@/libs/disposeable/Disposeable'
import { ConvertableProjectInfo } from './ConvertComMojangProject'
import { packs } from './Packs'
import { ProgressWindow } from '@/components/Windows/Progress/ProgressWindow'
import { Windows } from '@/components/Windows/Windows'
import { createReactable } from '@/libs/event/React'

export interface ProjectInfo {
	name: string
	icon: string
	config: IConfigJson
	favorite: boolean
	packs: { type: TPackTypeId; uuid: string; path: string }[]
}

export class ProjectManager {
	public static projects: ProjectInfo[] = []
	public static convertableProjects: ConvertableProjectInfo[] = []

	public static currentProject: Project | null = null

	public static updatedProjects: Event<void> = new Event()
	public static updatedConvertableProjects: Event<void> = new Event()
	public static updatedCurrentProject: Event<void> = new Event()

	private static cacheFileSystem = new LocalFileSystem()

	public static setup() {
		this.cacheFileSystem.setRootName('projectCache')

		Settings.addSetting('outputFolder', {
			default: null,
			async save(value) {
				await set('defaultOutputFolder', value)

				return 'set'
			},
			async load(value) {
				if (value === 'set') return await get('defaultOutputFolder')
			},
		})
	}

	public static async loadProjects() {
		if (fileSystem instanceof PWAFileSystem && !fileSystem.setup) {
			this.projects = []

			if (await this.cacheFileSystem.exists('projects.json')) this.projects = await this.cacheFileSystem.readFileJson('projects.json')

			this.updatedProjects.dispatch()

			return
		}

		if (!(await fileSystem.exists('projects'))) await fileSystem.makeDirectory('projects')

		let items = await fileSystem.readDirectoryEntries('projects')

		const foldersToLoad = items.filter((item) => item.kind === 'directory').map((item) => item.path)

		this.projects = []

		for (const path of foldersToLoad) {
			const projectInfo = await this.getProjectInfo(path)

			if (projectInfo) this.projects.push(projectInfo)
		}

		this.updateProjectCache()

		this.updatedProjects.dispatch()

		await ProjectManager.loadConvertableProjects()
	}

	public static addProject(project: ProjectInfo) {
		this.projects.push(project)

		this.updateProjectCache()

		this.updatedProjects.dispatch()
	}

	public static async createProject(config: CreateProjectConfig, fileSystem: BaseFileSystem) {
		const packDefinitions: { id: string; defaultPackPath: string }[] = await Data.get('packages/minecraftBedrock/packDefinitions.json')
		packDefinitions.push({
			id: 'bridge',
			defaultPackPath: '.bridge',
		})

		const projectPath = join('projects', config.name)

		await fileSystem.makeDirectory(projectPath)

		await Promise.all(
			config.packs.map(async (packId: string) => {
				const pack = packs[packId]
				const packDefinition = packDefinitions.find((pack) => pack.id === packId)

				if (pack === undefined || packDefinition === undefined) return

				await pack.create(fileSystem, projectPath, config, join(projectPath, packDefinition.defaultPackPath))
			})
		)

		const projectInfo = await this.getProjectInfo(projectPath)

		if (!projectInfo) throw new Error('Failed to create project!')

		this.addProject(projectInfo)
	}

	public static async loadProject(name: string) {
		console.time('[App] Load Project')

		const progressWindow = new ProgressWindow('projects.loading')
		Windows.open(progressWindow)

		this.currentProject = new BedrockProject(name)

		await this.currentProject.load()

		this.updatedCurrentProject.dispatch()

		Windows.close(progressWindow)

		console.timeEnd('[App] Load Project')
	}

	public static async closeProject() {
		if (!this.currentProject) return

		await this.currentProject.dispose()

		this.currentProject = null

		this.updatedCurrentProject.dispatch()
	}

	public static async getProjectInfo(path: string): Promise<ProjectInfo | undefined> {
		if (basename(path) === 'bridge-temp-project') return undefined

		if (!(await fileSystem.exists(join(path, 'config.json')))) return undefined

		let config: undefined | any = undefined

		try {
			config = await fileSystem.readFileJson(join(path, 'config.json'))
		} catch {}

		if (config === undefined) return undefined

		if (!config.packs) return undefined

		let iconDataUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

		for (const [packId, packPath] of Object.entries(config.packs)) {
			const projectPackPath = join(path, packPath as string)

			if (await fileSystem.exists(join(projectPackPath, 'pack_icon.png'))) {
				iconDataUrl = await fileSystem.readFileDataUrl(join(projectPackPath, 'pack_icon.png'))
			}
		}

		let favorites: string[] = []

		try {
			favorites = JSON.parse((await get('favoriteProjects')) as string)
		} catch {}

		const packs: { type: TPackTypeId; uuid: string; path: string }[] = (
			await Promise.all(
				Object.entries(config.packs as Record<string, string>).map(async ([id, packPath]) => {
					let manifest: any | null = null

					if (await fileSystem.exists(join(path, packPath, 'manifest.json'))) {
						try {
							manifest = await fileSystem.readFileJson(join(path, packPath, 'manifest.json'))
						} catch {}
					}

					if (!manifest) return null

					const uuid = manifest.header?.uuid

					if (!uuid) return null

					return {
						type: id as TPackTypeId,
						uuid,
						path: packPath,
					}
				})
			)
		).filter((pack) => pack !== null)

		return {
			name: basename(path),
			icon: iconDataUrl,
			config: await fileSystem.readFileJson(join(path, 'config.json')),
			favorite: favorites.includes(basename(path)),
			packs,
		}
	}

	public static async toggleFavoriteProject(name: string) {
		let favorites: string[] = []

		try {
			favorites = JSON.parse((await get('favoriteProjects')) as string)
		} catch {}

		if (favorites.includes(name)) {
			favorites.splice(favorites.indexOf(name), 1)
		} else {
			favorites.push(name)
		}

		const project = ProjectManager.projects.find((project) => project.name === name)

		if (project) {
			project.favorite = favorites.includes(name)

			ProjectManager.updateProjectCache()

			ProjectManager.updatedProjects.dispatch()
		}

		await set('favoriteProjects', JSON.stringify(favorites))
	}

	private static async updateProjectCache() {
		await this.cacheFileSystem.writeFileJson('projects.json', this.projects, false)
	}

	private static async loadConvertableProjects() {
		ProjectManager.convertableProjects = []

		if (fileSystem instanceof PWAFileSystem) {
			const outputFolder: FileSystemDirectoryHandle | undefined = Settings.get('outputFolder')

			if (!outputFolder) return

			const comMojangFileSystem = new PWAFileSystem()
			comMojangFileSystem.setBaseHandle(outputFolder)

			if (outputFolder && (await comMojangFileSystem.ensurePermissions(outputFolder))) {
				await ProjectManager.loadConvertableProjectsFromComMojang(comMojangFileSystem)

				ProjectManager.updatedConvertableProjects.dispatch()
			}
		}
	}

	private static async loadConvertableProjectsFromComMojang(comMojangFileSystem: BaseFileSystem) {
		if (await comMojangFileSystem.exists('/development_behavior_packs/')) {
			const packsEntries = await comMojangFileSystem.readDirectoryEntries('/development_behavior_packs/')

			for (const entry of packsEntries) {
				await ProjectManager.loadConvertablePackFromComMojang(comMojangFileSystem, entry.path, 'behaviorPack')
			}
		}

		if (await comMojangFileSystem.exists('/development_resource_packs/')) {
			const packsEntries = await comMojangFileSystem.readDirectoryEntries('/development_resource_packs/')

			for (const entry of packsEntries) {
				await ProjectManager.loadConvertablePackFromComMojang(comMojangFileSystem, entry.path, 'resourcePack')
			}
		}
	}

	public static async loadConvertablePackFromComMojang(comMojangFileSystem: BaseFileSystem, path: string, type: TPackTypeId) {
		let iconDataUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

		if (await comMojangFileSystem.exists(join(path, 'pack_icon.png'))) {
			iconDataUrl = await comMojangFileSystem.readFileDataUrl(join(path, 'pack_icon.png'))
		}

		if (!(await comMojangFileSystem.exists(join(path, 'manifest.json')))) return

		let manifest: any | null = null

		try {
			manifest = await comMojangFileSystem.readFileJson(join(path, 'manifest.json'))
		} catch {}

		if (!manifest) return

		let name = manifest.header?.name

		if (!name) return

		if (name === 'pack.name') {
			let languages: string[] | null = null

			try {
				languages = await comMojangFileSystem.readFileJson(join(path, 'texts', 'languages.json'))
			} catch {}

			if (!languages || languages.length === 0) return

			const language = languages[0]

			if (!language) return

			if (!(await comMojangFileSystem.exists(join(path, 'texts', language + '.lang')))) return

			const langFile = await comMojangFileSystem.readFileText(join(path, 'texts', language + '.lang'))

			const nameLine = langFile.split(/\n|\r/).find((line) => line.startsWith('pack.name='))

			if (!nameLine) return

			name = nameLine.substring('pack.name='.length)
		}

		const uuid = manifest.header?.uuid

		if (!uuid) return

		if (ProjectManager.projects.some((project) => project.packs.some((pack) => pack.uuid === uuid))) return

		const relatedPackUuids: string[] = []

		if (manifest.dependencies) {
			const dependencies: undefined | any[] = manifest.dependencies

			for (const dependency of dependencies!) {
				if (dependency.uuid) relatedPackUuids.push(dependency.uuid)
			}
		}

		const relatedPack = ProjectManager.convertableProjects.find((project) =>
			project.packs.some((pack) => relatedPackUuids.includes(pack.uuid) || pack.relatedPacks.includes(uuid))
		)

		if (relatedPack) {
			relatedPack.packs.push({
				type,
				uuid,
				path,
				relatedPacks: relatedPackUuids,
			})
		} else {
			ProjectManager.convertableProjects.push({
				icon: iconDataUrl,
				name,
				packs: [{ type, uuid, path, relatedPacks: relatedPackUuids }],
				type: (await comMojangFileSystem.exists(join(path, 'bridge'))) ? 'v1' : 'com.mojang',
			})
		}
	}
}

export const useProjects = createReactable(ProjectManager.updatedProjects, () => [...ProjectManager.projects])

export const useConvertableProjects = createReactable(ProjectManager.updatedConvertableProjects, () => [
	...ProjectManager.convertableProjects,
])

export const useCurrentProject = createReactable(ProjectManager.updatedCurrentProject, () => ProjectManager.currentProject)

export function useUsingProjectOutputFolder(): Ref<boolean> {
	const usingProjectOutputFolder: Ref<boolean> = ref(false)

	function update() {
		if (!ProjectManager.currentProject) {
			usingProjectOutputFolder.value = false

			return
		}

		usingProjectOutputFolder.value = ProjectManager.currentProject.usingProjectOutputFolder
	}

	let disposable: Disposable

	watch(useCurrentProject(), (newProject, oldProject) => {
		if (oldProject) disposable.dispose()

		if (newProject) {
			disposable = newProject.usingProjectOutputFolderChanged.on(update)

			update()
		}
	})

	onMounted(() => {
		if (ProjectManager.currentProject) disposable = ProjectManager.currentProject.usingProjectOutputFolderChanged.on(update)

		update()
	})
	onUnmounted(() => {
		if (ProjectManager.currentProject) disposable.dispose()
	})

	return usingProjectOutputFolder
}
