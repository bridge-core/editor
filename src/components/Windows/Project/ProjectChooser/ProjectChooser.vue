<template>
	<SidebarWindow
		windowTitle="windows.projectChooser.title"
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
				:label="t('windows.projectChooser.searchProjects')"
				v-model="sidebar._filter"
				outlined
				dense
			/>
		</template>
		<template #default>
			<div class="d-flex mb-4">
				<img
					class="pr-4"
					height="64"
					:src="sidebar.currentState.imgSrc"
				/>
				<div>
					<h1>{{ sidebar.currentState.projectName }}</h1>
					<h3>by Minecraft</h3>
				</div>
			</div>
			<div>
				<h4>Contains:</h4>
				<v-chip
					v-for="pack in sidebar.currentState.contains"
					:key="pack.id"
					:color="pack.color"
					small
					class="mr-2"
				>
					{{ pack.id }}
				</v-chip>
			</div>
		</template>

		<template #actions="{ selectedSidebar }">
			<v-spacer />
			<v-btn
				color="primary"
				:disabled="currentProject === selectedSidebar"
				@click="onSelectProject"
			>
				Select
			</v-btn>
		</template>
	</SidebarWindow>
</template>

<script>
import SidebarWindow from '@/components/Windows/Layout/SidebarWindow.vue'

import { App } from '@/App'
import { FileType } from '@/appCycle/FileType'
import { PackType } from '@/appCycle/PackType'
import { TranslationMixin } from '@/utils/locales'
import { selectProject } from '@/components/Project/Loader'

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
		onSelectProject() {
			selectProject(this.sidebar.selected)
			this.currentWindow.close()
		},
	},
}
</script>

<style>
img {
	image-rendering: pixelated;
}
</style>
