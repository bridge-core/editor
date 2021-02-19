<template>
	<BaseWindow
		windowTitle="windows.changelogWindow.title"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="600"
		:height="600"
		@closeWindow="onClose"
	>
		<template #default>
			<div class="mt-4 mb-2 d-flex align-center">
				<v-icon color="primary" class="mr-2" large>mdi-update</v-icon>
				<h1>v{{ $data.version }}</h1>
			</div>

			<v-divider class="mb-4" />
			<div class="changelog" v-html="$data.changelog"></div>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'

export default {
	name: 'ChangelogComponent',
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow
	},
	methods: {
		onClose() {
			this.currentWindow.close()
		},
	},
}
</script>

<style>
.changelog ul {
	margin-bottom: 24px;
}
</style>
