<template>
	<SidebarWindow
		windowTitle="sidebar.compiler.name"
		:isVisible="state.isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:percentageWidth="80"
		:percentageHeight="80"
		@closeWindow="onClose"
		:sidebarItems="sidebar.elements"
		:actions="state.actions"
		v-model="sidebar.selected"
	>
		<template #default="{ selectedSidebar }">
			<component
				v-if="categories[selectedSidebar]"
				:is="categories[selectedSidebar].component"
				:data="categories[selectedSidebar].data.value"
			/>
		</template>
	</SidebarWindow>
</template>

<script lang="ts" setup>
import SidebarWindow from '/@/components/Windows/Layout/SidebarWindow.vue'

const props = defineProps(['window'])
const state = props.window.getState()
const sidebar = props.window.sidebar
const categories = props.window.categories

function onClose() {
	props.window.close()
}
</script>
