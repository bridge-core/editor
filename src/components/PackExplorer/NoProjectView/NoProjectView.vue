<template>
	<div class="pa-2">
		<v-progress-linear v-if="isLoading" indeterminate />
		<NoProjects v-else-if="projectData.length === 0" />

		<template v-else>
			<BridgeFolderBtn />
			<CreateProjectBtn />

			<v-slide-y-transition class="py-0" group>
				<Project
					v-for="project in projectData"
					:key="`${project.name}//${project.requiresPermissions}`"
					:project="project"
					@click="
						selectProject(project.name, project.requiresPermissions)
					"
					@pin="onFavoriteProject(project)"
				/>
			</v-slide-y-transition>
		</template>
	</div>
</template>

<script>
import { App } from '/@/App'
import CreateProjectBtn from './CreateProjectBtn.vue'
import BridgeFolderBtn from './BridgeFolderBtn.vue'
import NoProjects from './NoProjects.vue'
import Project from './Project.vue'

export default {
	components: {
		CreateProjectBtn,
		BridgeFolderBtn,
		NoProjects,
		Project,
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
				this.projectData
			)
		},

		async selectProject(name, requiresPermissions) {
			const app = await App.getApp()

			if (requiresPermissions) {
				const wasSuccessful = await app.setupBridgeFolder()
				if (!wasSuccessful) return
			}

			await app.projectManager.selectProject(name, true)
		},

		async onFavoriteProject(project) {
			project.isFavorite = !project.isFavorite
			this.sortProjects()
			await this.saveProjects()
		},
	},
}
</script>
