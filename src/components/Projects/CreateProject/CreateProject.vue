<template>
	<SidebarWindow
		v-if="state.shouldRender"
		windowTitle="windows.createProject.title"
		:isVisible="state.isVisible"
		:hasMaximizeButton="false"
		:hasCloseButton="true"
		:isFullscreen="false"
		:isPersistent="state.isCreatingProject"
		:percentageWidth="80"
		:percentageHeight="80"
		:sidebarItems="sidebar.elements"
		v-model="sidebar.selected"
		@closeWindow="close"
	>
		<template #default>
			<component
				:is="getCurrentComponent(sidebar.selected)"
				:window="window"
			/>
		</template>

		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				:disabled="!window.hasRequiredData || state.isCreatingProject"
				:loading="state.isCreatingProject"
				@click="createProject"
			>
				<v-icon class="pr-2">mdi-plus</v-icon>
				<span>{{ t('windows.createProject.create') }}</span>
			</v-btn>
		</template>
	</SidebarWindow>
</template>

<script lang="ts" setup>
import SidebarWindow from '/@/components/Windows/Layout/SidebarWindow.vue'
import { useTranslations } from '../../Composables/useTranslations'
import { computed } from 'vue'
import { createCategories } from './CreateCategories'

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.state
const sidebar = props.window.sidebar

async function createProject() {
	state.isCreatingProject = true
	await props.window.createProject()
	state.isCreatingProject = false
	props.window.close()
}
function close() {
	props.window.close()
}

function getCurrentComponent(id: string) {
	return createCategories.find((category) => category.id === id)?.component
}
</script>

<style scoped>
.content-area {
	border: solid 2px transparent;
}
.content-area.selected {
	border: 2px solid var(--v-primary-base);
}
</style>
