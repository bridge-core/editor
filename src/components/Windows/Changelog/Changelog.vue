<template>
	<BaseWindow
		windowTitle="windows.changelogWindow.title"
		:isVisible="state.isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="600"
		:height="600"
		@closeWindow="onClose"
	>
		<template #default>
			<div class="mt-4 mb-2 d-flex align-center">
				<v-icon color="primary" class="mr-2" large>mdi-update</v-icon>
				<h1 class="text-xl font-semibold">v{{ window.version }}</h1>
			</div>

			<v-divider class="mb-4" />
			<div class="changelog" v-html="window.changelog"></div>
		</template>
	</BaseWindow>
</template>

<script lang="ts" setup>
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'

const props = defineProps(['window'])
const state = props.window.getState()

function onClose() {
	props.window.close()
}
</script>

<style>
.changelog ul {
	margin-bottom: 24px;
}

.changelog hr {
	margin-bottom: 24px;
}

.changelog img {
	max-width: 100%;
}

.changelog h1 {
	@apply text-3xl font-bold;
}
.changelog h2 {
	@apply text-2xl font-semibold;
}
.changelog h3 {
	@apply text-xl font-semibold;
}
.changelog h4 {
	@apply text-lg font-medium;
}
.changelog h5 {
	@apply text-base font-semibold;
}
.changelog h6 {
	@apply text-base font-medium;
}

.changelog li {
	@apply list-disc;
}
</style>
