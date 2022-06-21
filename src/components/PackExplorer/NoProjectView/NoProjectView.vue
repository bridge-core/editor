<template>
	<div class="pa-2">
		<v-progress-linear v-if="isLoading" indeterminate />
		<NoProjects v-else-if="projectData.length === 0" />

		<template v-else>
			<BridgeFolderBtn />
			<CreateProjectBtn />

			<v-row dense>
				<v-col
					v-for="(
						{ displayName, icon, name, requiresPermissions }, i
					) in projectData"
					:key="i"
					xs="12"
					sm="12"
					md="6"
					lg="4"
					xl="3"
				>
					<BridgeSheet
						dark
						:style="{
							overflow: 'hidden',
							height: '100%',
						}"
						v-ripple
						@click.native="selectProject(name, requiresPermissions)"
					>
						<img
							v-if="icon"
							:src="icon"
							:alt="displayName"
							:style="{
								width: '100%',
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
									displayName[0].toLowerCase()
								}}-box-outline
							</v-icon>
						</div>

						<p
							class="px-2"
							:style="{
								overflow: 'hidden',
								'white-space': 'nowrap',
								'text-overflow': 'ellipsis',
							}"
						>
							{{ displayName }}
						</p>
					</BridgeSheet>
				</v-col>
			</v-row>
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
			this.projectData = await app.fileSystem.readJSON(
				'~local/data/projects.json'
			)

			this.isLoading = false
		},

		async selectProject(name, requiresPermissions) {
			const app = await App.getApp()

			if (requiresPermissions) {
				const wasSuccessful = await app.setupBridgeFolder()
				if (!wasSuccessful) return
			}

			await app.projectManager.selectProject(name, true)
		},
	},
}
</script>
