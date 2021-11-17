<template>
	<span v-ripple class="d-flex align-center rounded-lg">
		<v-icon class="mx-1" small :color="color">{{ icon }}</v-icon>

		{{ fileName }}

		<v-spacer />
		<span class="mr-1"><slot name="append" /></span>
	</span>
</template>

<script>
import { basename } from '/@/utils/path'
import { App } from '/@/App'

export default {
	props: {
		filePath: String,
	},
	data: () => ({
		icon: 'mdi-file-outline',
		color: null,
	}),
	mounted() {
		App.getApp().then((app) => {
			this.icon =
				App.fileType.get(this.filePath)?.icon ?? 'mdi-file-outline'
			this.color = App.packType.get(this.filePath)?.color ?? null
		})
	},
	computed: {
		fileName() {
			return basename(this.filePath)
		},
	},
}
</script>
