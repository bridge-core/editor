<template>
	<v-btn @click="selectBridgeFolder" :color="color" class="mb-2" block>
		<v-icon class="mr-1">mdi-folder-outline</v-icon>
		{{
			t(
				`windows.packExplorer.noProjectView.${
					hasDirectorySelected && !isBridgeFolderSelected
						? 'accessBridgeFolder'
						: 'chooseBridgeFolder'
				}`
			)
		}}
	</v-btn>
</template>

<script>
import { get } from 'idb-keyval'
import { App } from '/@/App'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'

export default {
	mixins: [TranslationMixin],
	props: {
		color: {
			default: 'primary',
			type: String,
		},
	},
	async mounted() {
		const app = await App.getApp()

		this.hasDirectorySelected = (await get('bridgeBaseDir')) !== undefined
		this.disposable = app.bridgeFolderSetup.once(() => {
			this.isBridgeFolderSelected = true
		})
	},
	destroyed() {
		if (this.disposable) {
			this.disposable.dispose()
			this.disposable = null
		}
	},
	data() {
		return {
			hasDirectorySelected: false,
			isBridgeFolderSelected: false,
			disposable: null,
		}
	},
	methods: {
		async selectBridgeFolder() {
			const app = await App.getApp()

			await app.setupBridgeFolder(this.isBridgeFolderSelected)
		},
	},
}
</script>
