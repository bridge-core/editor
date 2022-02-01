<template>
	<SidebarWindow
		windowTitle="sidebar.compiler.name"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:percentageWidth="80"
		:percentageHeight="80"
		@closeWindow="onClose"
		:sidebarItems="sidebar.elements"
		:actions="actions"
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

<script>
import SidebarWindow from '/@/components/Windows/Layout/SidebarWindow.vue'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'

export default {
	name: 'CompilerWindow',
	mixins: [TranslationMixin],
	components: {
		SidebarWindow,
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
