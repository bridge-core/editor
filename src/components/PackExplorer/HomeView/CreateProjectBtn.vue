<template>
	<v-tooltip
		:disabled="availableWidth > 220"
		:color="color ? color : 'tooltip'"
		right
	>
		<template v-slot:activator="{ on }">
			<v-btn
				v-on="on"
				@click.stop="createProject"
				:color="color"
				class="mb-2"
				block
				max-width="100%"
				ref="button"
				:style="{
					overflow: 'hidden',
				}"
			>
				<v-icon class="mr-1">mdi-plus</v-icon>
				<span v-if="availableWidth > 220">
					{{ t('packExplorer.noProjectView.createLocalProject') }}
				</span>
			</v-btn>
		</template>

		<span>
			{{ t('packExplorer.noProjectView.createLocalProject') }}
		</span>
	</v-tooltip>
</template>

<script>
import { isUsingFileSystemPolyfill } from '../../FileSystem/Polyfill'
import { App } from '/@/App'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'

export default {
	mixins: [TranslationMixin],
	props: {
		color: {
			default: 'background',
			type: String,
		},
	},
	setup() {
		return { isUsingFileSystemPolyfill }
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
		this.disposables = []
	},
	data: () => ({
		availableWidth: 0,
		disposables: [],
	}),
	methods: {
		async createProject() {
			const app = await App.getApp()

			app.windows.createProject.open()
		},
		calculateAvailableWidth() {
			if (this.$refs.button)
				this.availableWidth = this.$refs.button.$el.getBoundingClientRect().width
		},
	},
}
</script>
