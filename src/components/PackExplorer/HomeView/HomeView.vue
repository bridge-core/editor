<template>
	<div class="pa-2">
		<v-progress-linear v-if="isLoading" indeterminate />
		<SetupView v-else-if="projectData.length === 0" />

		<template v-else>
			<BridgeFolderBtn />
			<CreateProjectBtn />

			<v-slide-y-transition class="py-0" group>
				<Project
					v-for="project in projectData"
					:key="`${project.name}//${project.requiresPermissions}`"
					:project="project"
					@click="selectProject(project)"
					@pin="onFavoriteProject(project)"
					:isLoading="project.isLoading"
				/>
			</v-slide-y-transition>
		</template>
	</div>
</template>

<script>
import { App } from '/@/App'
import CreateProjectBtn from './CreateProjectBtn.vue'
import BridgeFolderBtn from './BridgeFolderBtn.vue'
import SetupView from './SetupView.vue'
import Project from './Project.vue'
import { isUsingFileSystemPolyfill } from '../../FileSystem/Polyfill'

export default {
	components: {
		CreateProjectBtn,
		BridgeFolderBtn,
		SetupView,
		Project,
	},
	setup() {
		return {
			isUsingFileSystemPolyfill,
		}
	},
	mounted() {
		this.loadProjects()

		this.disposable = App.eventSystem.on(
			'availableProjectsFileChanged',
			() => this.loadProjects()
		)
	},
	destroyed() {
		if (this.disposable) {
			this.disposable.dispose()
			this.disposable = null
		}
	},

	data() {
		return {
			isLoading: true,
			projectData: [],
			disposable: null,
		}
	},
	methods: {
		async loadProjects() {
			this.isLoading = true

			const app = await App.getApp()
			this.projectData = await app.fileSystem
				.readJSON('~local/data/projects.json')
				.catch(() => [])
			this.projectData = this.projectData.map((project) => {
				return {
					...project,
					isFavorite: project.isFavorite ?? false,
					isLoading: false,
				}
			})
			this.sortProjects()

			this.isLoading = false
		},
		sortProjects() {
			this.projectData = this.projectData.sort((a, b) => {
				if (a.isFavorite && !b.isFavorite) return -1
				if (!a.isFavorite && b.isFavorite) return 1
				return a.displayName.localeCompare(b.displayName)
			})
		},
		async saveProjects() {
			const app = await App.getApp()
			await app.fileSystem.writeJSON(
				'~local/data/projects.json',
				this.projectData.map((project) => ({
					...project,
					isLoading: undefined,
				}))
			)
		},

		async selectProject(project) {
			project.isLoading = true
			const app = await App.getApp()

			if (project.requiresPermissions) {
				const wasSuccessful = await app.setupBridgeFolder()
				if (!wasSuccessful) {
					project.isLoading = false
					return
				}
			}

			await app.projectManager.selectProject(project.name, true)
			project.isLoading = false
		},

		async onFavoriteProject(project) {
			project.isFavorite = !project.isFavorite
			this.sortProjects()
			await this.saveProjects()
		},
	},
}
</script>
