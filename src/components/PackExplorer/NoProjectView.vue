<template>
	<div class="pa-2">
		<v-progress-linear v-if="isLoading" indeterminate />
		<p v-else-if="projectData.length === 0">
			{{ t('windows.packExplorer.noProjectView.noProjectsFound') }}
		</p>

		<template v-else>
			<v-row dense>
				<v-col
					v-for="({ displayName, icon, name }, i) in projectData"
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
						}"
						v-ripple
						@click.native="selectProject(name)"
					>
						<img
							:src="icon"
							:alt="displayName"
							:style="{
								width: '100%',
								'image-rendering': 'pixelated',
							}"
						/>
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
import { TranslationMixin } from '../Mixins/TranslationMixin'
import BridgeSheet from '/@/components/UIElements/Sheet.vue'

export default {
	mixins: [TranslationMixin],
	components: {
		BridgeSheet,
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
		async selectProject(name) {
			const app = await App.getApp()
			app.projectManager.selectProject(name)
		},
	},
}
</script>
