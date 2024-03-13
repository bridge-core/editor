import { EventSystem } from '@/libs/event/EventSystem'
import { fileSystem } from '@/App'
import { Project, validProject } from './Project'
import { basename, join } from '@/libs/path'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { CreateProjectConfig } from './CreateProjectConfig'
import { Ref, onMounted, onUnmounted, ref } from 'vue'
import { BehaviourPack } from './create/packs/BehaviorPack'
import { BridgePack } from './create/packs/Bridge'
import { Pack } from './create/packs/Pack'
import { ResourcePack } from './create/packs/ResourcePack'
import { SkinPack } from './create/packs/SkinPack'
import { BedrockProject } from './BedrockProject'
import { IConfigJson, defaultPackPaths } from 'mc-project-core'
import { LocalFileSystem } from '@/libs/fileSystem/LocalFileSystem'
import { Data } from '@/libs/data/Data'

export const packs: {
	[key: string]: Pack | undefined
} = {
	bridge: new BridgePack(),
	behaviorPack: new BehaviourPack(),
	resourcePack: new ResourcePack(),
	skinPack: new SkinPack(),
}

export interface ProjectInfo {
	name: string
	icon: string
	config: IConfigJson
}

export class ProjectManager {
	public static projects: ProjectInfo[] = []
	public static eventSystem = new EventSystem(['updatedProjects', 'updatedCurrentProject'])
	public static currentProject: Project | null = null

	private static cacheFileSystem = new LocalFileSystem()

	public static setup() {
		this.cacheFileSystem.setRootName('projectCache')
	}

	public static async loadProjects() {
		if (fileSystem instanceof PWAFileSystem && !fileSystem.setup) {
			this.projects = []

			if (await this.cacheFileSystem.exists('projects.json'))
				this.projects = await this.cacheFileSystem.readFileJson('projects.json')

			this.eventSystem.dispatch('updatedProjects', null)

			return
		}

		if (!(await fileSystem.exists('projects'))) await fileSystem.makeDirectory('projects')

		let items = await fileSystem.readDirectoryEntries('projects')

		const foldersToLoad = items.filter((item) => item.type === 'directory').map((item) => item.path)

		this.projects = []

		for (const path of foldersToLoad) {
			if (!(await validProject(path))) continue

			this.projects.push(await this.getProjectInfo(path))
		}

		this.updateProjectCache()

		this.eventSystem.dispatch('updatedProjects', null)
	}

	private static addProject(project: ProjectInfo) {
		this.projects.push(project)

		this.updateProjectCache()

		this.eventSystem.dispatch('updatedProjects', null)
	}

	public static async createProject(config: CreateProjectConfig, fileSystem: BaseFileSystem) {
		const packDefinitions: { id: string; defaultPackPath: string }[] = await Data.get(
			'packages/minecraftBedrock/packDefinitions.json'
		)
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

		this.addProject(await this.getProjectInfo(projectPath))
	}

	public static async loadProject(name: string) {
		console.time('[APP] Load Project')

		this.currentProject = new BedrockProject(name)

		await this.currentProject.load()

		this.eventSystem.dispatch('updatedCurrentProject', null)

		console.timeEnd('[APP] Load Project')
	}

	public static async getProjectInfo(path: string): Promise<ProjectInfo> {
		let iconDataUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

		if (await fileSystem.exists(join(path, defaultPackPaths['behaviorPack'], 'pack_icon.png')))
			iconDataUrl = await fileSystem.readFileDataUrl(join(path, 'BP', 'pack_icon.png'))

		if (await fileSystem.exists(join(path, defaultPackPaths['resourcePack'], 'pack_icon.png')))
			iconDataUrl = await fileSystem.readFileDataUrl(join(path, 'BP', 'pack_icon.png'))

		if (await fileSystem.exists(join(path, defaultPackPaths['skinPack'], 'pack_icon.png')))
			iconDataUrl = await fileSystem.readFileDataUrl(join(path, 'BP', 'pack_icon.png'))

		return {
			name: basename(path),
			icon: iconDataUrl,
			config: await fileSystem.readFileJson(join(path, 'config.json')),
		}
	}

	public static useProjects(): Ref<ProjectInfo[]> {
		const projects: Ref<ProjectInfo[]> = ref(this.projects)

		const me = this

		function updateProjects() {
			projects.value = [...me.projects]
		}

		onMounted(() => me.eventSystem.on('updatedProjects', updateProjects))
		onUnmounted(() => me.eventSystem.off('updatedProjects', updateProjects))

		return projects
	}

	public static useCurrentProject(): Ref<Project | null> {
		// ts typing for some reason doesn't like this type being in a ref
		const currentProject: Ref<Project | null> = <any>ref(this.currentProject)

		const me = this

		function updateCurrentProject() {
			currentProject.value = me.currentProject
		}

		onMounted(() => me.eventSystem.on('updatedCurrentProject', updateCurrentProject))
		onUnmounted(() => me.eventSystem.off('updatedCurrentProject', updateCurrentProject))

		return currentProject
	}

	private static async updateProjectCache() {
		await this.cacheFileSystem.writeFileJson('projects.json', this.projects, false)
	}
}
