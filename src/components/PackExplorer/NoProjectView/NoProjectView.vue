<template>
	<div class="pa-2">
		<v-progress-linear v-if="isLoading" indeterminate />
		<NoProjects v-else-if="projectData.length === 0" />

		<template v-else>
			<BridgeFolderBtn />
			<CreateProjectBtn />

			<v-slide-y-transition class="py-0" group>
				<BridgeSheet
					v-for="project in projectData"
					:key="`${project.name}//${project.requiresPermissions}`"
					dark
					class="d-flex align-center mb-2"
					:style="{
						overflow: 'hidden',
						height: '5rem',
						border: `2px solid ${
							project.isFavorite
								? 'var(--v-primary-base)'
								: 'var(--v-background-base)'
						}`,
					}"
					v-ripple
					@click.native="
						selectProject(project.name, project.requiresPermissions)
					"
				>
					<img
						v-if="project.icon"
						:src="project.icon"
						:alt="project.displayName"
						class="rounded-lg"
						:style="{
							margin: '0 0.5rem',
							width: '4rem',
							'image-rendering': 'pixelated',
						}"
					/>
					<div class="d-flex justify-center" v-else>
						<v-icon
							color="primary"
							:style="{ 'font-size': '4rem' }"
							size="xl"
						>
							mdi-alpha-{{
								project.displayName[0].toLowerCase()
							}}-box-outline
						</v-icon>
					</div>

					<span
						class="px-2"
						:style="{
							overflow: 'hidden',
							'white-space': 'nowrap',
							'text-overflow': 'ellipsis',
						}"
					>
						{{ project.displayName }}
					</span>

					<v-spacer />
					<BridgeSheet
						class="px-1 d-flex align-center justify-center"
						:style="{
							marginRight: '0.5rem',
							height: '4rem',
						}"
					>
						<v-icon
							v-if="!project.requiresPermissions"
							color="accent"
						>
							mdi-lock-open-outline
						</v-icon>

						<!-- Star project button -->
						<v-btn
							icon
							small
							:color="project.isFavorite ? 'primary' : null"
							@click.stop="onFavoriteProject(project)"
						>
							<v-icon>
								mdi-pin{{
									project.isFavorite ? '' : '-outline'
								}}
							</v-icon>
						</v-btn>
					</BridgeSheet>
				</BridgeSheet>
			</v-slide-y-transition>
		</template>
	</div>
</template>

<script>
import { App } from '/@/App'
import BridgeSheet from '/@/components/UIElements/Sheet.vue'
import CreateProjectBtn from './CreateProjectBtn.vue'
import BridgeFolderBtn from './BridgeFolderBtn.vue'
import NoProjects from './NoProjects.vue'

export default {
	components: {
		BridgeSheet,
		CreateProjectBtn,
		BridgeFolderBtn,
		NoProjects,
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
