import { EventSystem } from '@/libs/event/EventSystem'
import { fileSystem, data } from '@/App'
import { Project, ProjectInfo, getProjectInfo, validProject } from './Project'
import { join } from '@/libs/path'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { CreateProjectConfig } from './CreateProjectConfig'
import { Ref, onMounted, onUnmounted, ref } from 'vue'
import { BehaviourPack } from './create/packs/BehaviorPack'
import { BridgePack } from './create/packs/Bridge'
import { Pack } from './create/packs/Pack'
import { ResourcePack } from './create/packs/ResourcePack'
import { SkinPack } from './create/packs/SkinPack'
import { BedrockProjectData } from '@/libs/data/bedrock/BedrockProjectData'
import { BedrockProject } from './BedrockProject'

export const packs: {
	[key: string]: Pack | undefined
} = {
	bridge: new BridgePack(),
	behaviorPack: new BehaviourPack(),
	resourcePack: new ResourcePack(),
	skinPack: new SkinPack(),
}

export class ProjectManager {
	public projects: ProjectInfo[] = []
	public eventSystem = new EventSystem([
		'updatedProjects',
		'updatedCurrentProject',
	])
	public currentProject: Project | null = null

	public async loadProjects() {
		if (fileSystem instanceof PWAFileSystem && !fileSystem.setup) {
			this.projects = []

			this.eventSystem.dispatch('updatedProjects', null)

			return
		}

		if (!(await fileSystem.exists('projects')))
			await fileSystem.makeDirectory('projects')

		let items = await fileSystem.readDirectoryEntries('projects')

		const foldersToLoad = items
			.filter((item) => item.type === 'directory')
			.map((item) => item.path)

		this.projects = []

		for (const path of foldersToLoad) {
			if (!(await validProject(path))) continue

			this.projects.push(await getProjectInfo(path))
		}

		this.eventSystem.dispatch('updatedProjects', null)
	}

	private addProject(project: ProjectInfo) {
		this.projects.push(project)

		this.eventSystem.dispatch('updatedProjects', null)
	}

	public async createProject(
		config: CreateProjectConfig,
		fileSystem: BaseFileSystem
	) {
		const packDefinitions: { id: string; defaultPackPath: string }[] =
			await data.get('packages/minecraftBedrock/packDefinitions.json')
		packDefinitions.push({
			id: 'bridge',
			defaultPackPath: '.bridge',
		})

		const projectPath = join('projects', config.name)

		await fileSystem.makeDirectory(projectPath)

		await Promise.all(
			config.packs.map(async (packId: string) => {
				const pack = packs[packId]
				const packDefinition = packDefinitions.find(
					(pack) => pack.id === packId
				)

				if (pack === undefined || packDefinition === undefined) return

				await pack.create(
					fileSystem,
					projectPath,
					config,
					join(projectPath, packDefinition.defaultPackPath)
				)
			})
		)

		this.addProject(await getProjectInfo(projectPath))
	}

	public async loadProject(name: string) {
		console.time('[APP] Load Project')

		this.currentProject = new BedrockProject(
			name,
			new BedrockProjectData(data)
		)

		await this.currentProject.load()

		this.eventSystem.dispatch('updatedCurrentProject', null)

		console.timeEnd('[APP] Load Project')
	}

	public useProjects(): Ref<ProjectInfo[]> {
		const projects: Ref<ProjectInfo[]> = ref(this.projects)

		const me = this

		function updateProjects() {
			projects.value = [...me.projects]
		}

		onMounted(() => me.eventSystem.on('updatedProjects', updateProjects))
		onUnmounted(() => me.eventSystem.off('updatedProjects', updateProjects))

		return projects
	}

	public useCurrentProject(): Ref<Project | null> {
		// ts typing for some reason doesn't like this type being in a ref
		const currentProject: Ref<Project | null> = <any>(
			ref(this.currentProject)
		)

		const me = this

		function updateCurrentProject() {
			currentProject.value = me.currentProject
		}

		onMounted(() =>
			me.eventSystem.on('updatedCurrentProject', updateCurrentProject)
		)
		onUnmounted(() =>
			me.eventSystem.off('updatedCurrentProject', updateCurrentProject)
		)

		return currentProject
	}
}
