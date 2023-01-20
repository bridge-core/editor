<template>
	<v-tooltip
		v-if="isTauriBuild"
		:disabled="availableWidth > 220"
		:color="color ? color : 'tooltip'"
		right
	>
		<template v-slot:activator="{ on }">
			<v-btn
				v-on="on"
				@click="onImportOldProjects"
				:color="color"
				class="mb-2"
				block
				max-width="100%"
				ref="button"
				:style="{
					overflow: 'hidden',
				}"
			>
				<v-icon class="mr-1">mdi-import</v-icon>
				<span v-if="availableWidth > 220">
					{{ t(`packExplorer.noProjectView.importOldProjects.name`) }}
				</span>
			</v-btn>
		</template>
		<span>
			{{ t(`packExplorer.noProjectView.importOldProjects.name`) }}
		</span>
	</v-tooltip>
</template>

<script>
import { App } from '/@/App'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import { importProjects } from '/@/components/ImportFolder/ImportProjects'

export default {
	mixins: [TranslationMixin],
	props: {
		color: {
			default: 'primary',
			type: String,
		},
	},
	setup() {
		return {
			isTauriBuild: import.meta.env.VITE_IS_TAURI_APP,
		}
	},
	async mounted() {
		const app = await App.getApp()

		// Logic for updating the current available width
		this.disposables.push(
			app.windowResize.on(() => this.calculateAvailableWidth())
		)
		this.calculateAvailableWidth()
	},
	destroyed() {
		this.disposables.forEach((disposable) => disposable.dispose())
		this.disposable = []
	},
	data() {
		return {
			disposables: [],
			availableWidth: 0,
		}
	},
	methods: {
		onImportOldProjects() {
			importProjects()
		},
		calculateAvailableWidth() {
			if (this.$refs.button)
				this.availableWidth =
					this.$refs.button.$el.getBoundingClientRect().width
		},
	},
}
</script>
