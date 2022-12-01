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
			Link Folder
		</v-btn>
	</div>
</template>

<script>
import InfoPanel from '/@/components/InfoPanel/InfoPanel.vue'
import { showFolderPicker } from '/@/components/FileSystem/Pickers/showFolderPicker'
import { App } from '/@/App'

export default {
	props: {
		data: Object,
	},
	components: {
		InfoPanel,
	},
	data: () => ({
		isTauriBuild: import.meta.env.VITE_IS_TAURI_APP,
		isLoading: false,
	}),
	methods: {
		async setOutputFolder() {
			this.isLoading = true
			const directoryHandle = await showFolderPicker()
			this.isLoading = false

			if (!directoryHandle) return

			const app = await App.getApp()
			app.comMojang.handleComMojangDrop(directoryHandle)
		},
	},
}
</script>
