<template>
	<v-tooltip
		v-if="!isUsingFileSystemPolyfill"
		:disabled="availableWidth > 220"
		:color="color ? color : 'tooltip'"
		right
	>
		<template v-slot:activator="{ on }">
			<v-btn
				v-on="on"
				@click="selectBridgeFolder"
				:color="color"
				class="mb-2"
				block
				max-width="100%"
				ref="button"
				:style="{
					overflow: 'hidden',
				}"
			>
				<v-icon class="mr-1">mdi-folder-outline</v-icon>
				<span v-if="availableWidth > 220">
					{{
						t(
							`packExplorer.noProjectView.${
								hasDirectorySelected && !isBridgeFolderSelected
									? 'accessBridgeFolder'
									: 'chooseBridgeFolder'
							}`
						)
					}}
				</span>
			</v-btn>
		</template>
		<span>
			{{
				t(
					`packExplorer.noProjectView.${
						hasDirectorySelected && !isBridgeFolderSelected
							? 'accessBridgeFolder'
							: 'chooseBridgeFolder'
					}`
				)
			}}
		</span>
	</v-tooltip>
</template>

<script>
import { get } from 'idb-keyval'
import { App } from '/@/App'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import { isUsingFileSystemPolyfill } from '../../FileSystem/Polyfill'

export default {
	mixins: [TranslationMixin],
	props: {
		color: {
			default: 'primary',
			type: String,
		},
	},
	setup() {
		return { isUsingFileSystemPolyfill }
	},
	async mounted() {
		const app = await App.getApp()

		this.hasDirectorySelected = (await get('bridgeBaseDir')) !== undefined
		this.disposables.push(
			app.bridgeFolderSetup.once(() => {
				this.isBridgeFolderSelected = true
			}, true)
		)

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
			hasDirectorySelected: false,
			isBridgeFolderSelected: false,
			disposables: [],
			availableWidth: 0,
		}
	},
	methods: {
		async selectBridgeFolder() {
			const app = await App.getApp()

			await app.setupBridgeFolder(this.isBridgeFolderSelected)
		},
		calculateAvailableWidth() {
			if (this.$refs.button)
				this.availableWidth = this.$refs.button.$el.getBoundingClientRect().width
		},
	},
}
</script>
