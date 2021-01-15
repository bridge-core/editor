<template>
	<BaseWindow
		v-if="shouldRender"
		:windowTitle="sidebar.displayName"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:percentageWidth="50"
		:percentageHeight="80"
		@closeWindow="onClose"
	>
		<component :is="sidebar.component" />
	</BaseWindow>
</template>

<script>
import BaseWindow from '@/components/Windows/Layout/BaseWindow.vue'
// console.log(BaseWindow)
export default {
	name: 'OldSidebarCompatWindow',
	components: {
		BaseWindow,
	},
	data() {
		return this.currentWindow.getState()
	},
	props: ['currentWindow'],
	methods: {
		onClose() {
			this.currentWindow.close()
		},
	},
}
</script>
