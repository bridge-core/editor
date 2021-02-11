<template>
	<div
		class="d-flex flex-column justify-center align-center px-4"
		:style="`padding-top: 14vh;`"
	>
		<img
			style="height: 128px; width: 128px;"
			class="mb-4"
			alt="bridge. Logo"
			src="@/_assets/logo_high_res.png"
		/>
		<h1 class="text-h3 text-center">{{ t('welcome.title') }}</h1>
		<h2 class="text-h6 mb-12 text-center">{{ t('welcome.subtitle') }}</h2>

		<v-row style="flex-wrap: nowrap; width: 60vw;">
			<v-col v-if="actions.length > 0" tag="ul">
				<p>{{ t('welcome.quickActions') }}</p>
				<v-divider class="mb-2" />
				<li
					v-for="action in actions"
					:key="action.id"
					class="d-flex rounded-lg pa-1 clickable"
					v-ripple
					@click="() => action.trigger()"
				>
					<a>
						<v-icon color="accent" medium>{{ action.icon }}</v-icon>
						{{ t(action.name) }}
					</a>
					<v-spacer></v-spacer>

					<span v-if="action.keyBinding">
						{{ action.keyBinding.toStrKeyCode() }}
					</span>
				</li>
			</v-col>

			<v-col
				v-if="$vuetify.breakpoint.smAndUp && files.length > 0"
				tag="ul"
			>
				<p>{{ t('welcome.recentFiles') }}</p>
				<v-divider class="mb-2" />
				<li
					v-for="file in files"
					:key="file.name"
					class="d-flex rounded-lg pa-1 clickable"
					v-ripple
					@click="openFile(file.path)"
				>
					<a>
						<v-icon :color="file.color || 'error'" medium>
							{{ file.icon }}
						</v-icon>
						{{ file.name }}
					</a>
				</li>
			</v-col>

			<v-col
				v-if="$vuetify.breakpoint.mdAndUp && projects.length > 0"
				tag="ul"
			>
				<p>{{ t('welcome.recentProjects') }}</p>
				<v-divider class="mb-2" />
				<li
					v-for="project in projects"
					:key="project.name"
					class="d-flex rounded-lg pa-1 clickable"
					v-ripple
					@click="selectProject(project.path)"
				>
					<a class="d-flex align-center">
						<img
							v-if="project.imgSrc"
							:src="project.imgSrc"
							:alt="`${project.name} Logo`"
							class="mr-1 pack-icon"
						/>
						{{ project.path }}
					</a>
				</li>
			</v-col>
		</v-row>
	</div>
</template>

<script>
import { TranslationMixin } from '@/utils/locales'
import ActionViewer from '@/components/Actions/ActionViewer'
import { App } from '@/App'
import { ProjectMixin } from '@/components/Mixins/Project'

export default {
	name: 'welcome-screen',
	mixins: [TranslationMixin, ProjectMixin],
	components: {
		ActionViewer,
	},

	async mounted() {
		const app = await App.getApp()
		const toLoad = [
			'bridge.action.newFile',
			'bridge.action.openFile',
			'bridge.action.openSettings',
		]
		this.actions = toLoad.map(l => app.actionManager.state[l])

		await app.projectManager.fired
		this.projectManager = app.projectManager
	},

	data: () => ({
		actions: [],
		projectManager: null,
	}),
	computed: {
		files() {
			if (!this.project) return []
			return this.project.recentFiles.elements
		},
		projects() {
			if (!this.projectManager) return []
			return this.projectManager.recentProjects.elements.filter(
				({ path }) => path !== this.projectManager.selectedProject
			)
		},
	},
	methods: {
		openFile(filePath) {
			App.getApp().then(app => app.tabSystem.open(filePath))
		},
		selectProject(projectName) {
			App.getApp().then(app =>
				app.projectManager.selectProject(projectName)
			)
		},
	},
}
</script>

<style scoped>
ul {
	padding-left: 0;
}
div,
li {
	list-style-type: none;
}
span {
	margin-left: 4px;
}
p {
	margin-bottom: 0;
}
.clickable {
	cursor: pointer;
}
.pack-icon {
	height: 24px;
	image-rendering: pixelated;
}
</style>
