<template>
	<SidebarWindow
		windowTitle="windows.settings.title"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:percentageWidth="80"
		:percentageHeight="80"
		@closeWindow="onClose"
		:sidebarItems="sidebar.elements"
		v-model="sidebar.selected"
	>
		<template #sidebar>
			<v-text-field
				class="pt-2"
				prepend-inner-icon="mdi-magnify"
				:label="t('windows.settings.searchSettings')"
				v-model.trim="sidebar._filter"
				outlined
				dense
			/>
		</template>
		<template #default="{ selectedSidebar }">
			<span
				v-if="
					sidebar.currentState.length === 0 && sidebar.filter !== ''
				"
			>
				No setting matches your search for "{{ sidebar.filter }}".
			</span>

			<component
				class="mb-6"
				v-for="(control, i) in sidebar.currentState"
				:key="`${selectedSidebar}.${i}`"
				:is="control.component"
				:config="control.config"
				:value="control.value"
				@change="control.onChange"
			/>
		</template>
	</SidebarWindow>
</template>

<script>
import SidebarWindow from '@/components/Windows/Layout/SidebarWindow.vue'

import { App } from '@/App'
import { FileType } from '@/appCycle/FileType'
import { PackType } from '@/appCycle/PackType'
import { TranslationMixin } from '@/utils/locales'

export default {
	name: 'PackExplorerWindow',
	mixins: [TranslationMixin],
	components: {
		SidebarWindow,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow.getState()
	},
	methods: {
		onClose() {
			this.currentWindow.close()
		},
	},
}
</script>

<style></style>
