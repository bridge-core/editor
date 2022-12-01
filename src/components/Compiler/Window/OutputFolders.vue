<template>
	<div>
		<InfoPanel :infoPanel="data" />

		<v-btn
			v-if="isTauriBuild"
			class="mt-2 rounded-lg"
			@click="setOutputFolder"
			block
			:loading="isLoading"
		>
			<v-icon class="mr-2">mdi-folder-sync-outline</v-icon>
			{{ t('comMojang.linkFolder') }}
		</v-btn>

		<!-- TODO: Remove debug display -->
		<span v-if="isTauriBuild">
			{{ path }}
		</span>
	</div>
</template>

<script>
import InfoPanel from '/@/components/InfoPanel/InfoPanel.vue'
import { showFolderPicker } from '/@/components/FileSystem/Pickers/showFolderPicker'
import { App } from '/@/App'
import { TranslationMixin } from '../../Mixins/TranslationMixin'

export default {
	mixins: [TranslationMixin],
	props: {
		data: Object,
	},
	components: {
		InfoPanel,
	},
	data: () => ({
		isTauriBuild: import.meta.env.VITE_IS_TAURI_APP,
		isLoading: false,
		path: null,
	}),
	mounted() {
		if (!import.meta.env.VITE_IS_TAURI_APP) return

		App.getApp().then((app) => {
			this.path = app.comMojang.fileSystem.baseDirectory
				.getBaseStore()
				.getBaseDirectory()
		})
	},
	methods: {
		async setOutputFolder() {
			this.isLoading = true
			const directoryHandle = await showFolderPicker()
			this.isLoading = false

			if (!directoryHandle) return

			const app = await App.getApp()
			app.comMojang.handleComMojangDrop(directoryHandle)
			this.$emit('closeWindow')
		},
	},
}
</script>
