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
				@closeWindow="onClose"
				ref="content"
			/>
		</template>
	</SidebarWindow>
</template>

<script lang="ts" setup>
import { nextTick, Ref, ref, watch } from 'vue'
import SidebarWindow from '/@/components/Windows/Layout/SidebarWindow.vue'

const props = defineProps(['window'])
const state = props.window.getState()
const sidebar = props.window.sidebar
const categories = props.window.categories
const content: Ref<any> = ref(null)

function onClose() {
	props.window.close()
}

watch(
	() => sidebar.selected,
	() => {
		nextTick(() => {
			if (!content.value) return

			if (!content.value.open) return

			content.value.open()
		})
	}
)
</script>
