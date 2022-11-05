<template>
	<SidebarWindow
		v-if="state.shouldRender"
		:windowTitle="state.windowTitle"
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
		<template #sidebar>
			<v-progress-linear
				class="mt-1 mb-3"
				rounded
				:value="
					(sidebar.currentSelectionIndex /
						sidebar.maxSelectionIndex) *
					100
				"
			/>
		</template>

		<template #default>
			<component
				:is="getCurrentComponent(sidebar.selected)"
				:window="window"
			/>
		</template>

		<template #actions>
			<v-btn color="primary" @click="sidebar.selectNext()">
				Next
				<v-icon>mdi-chevron-right</v-icon>
			</v-btn>
			<v-spacer />

			<!-- <v-btn
				color="primary"
				:disabled="!window.hasRequiredData || state.isCreatingProject"
				:loading="state.isCreatingProject"
				@click="createProject"
			>
				<v-icon class="pr-2">mdi-plus</v-icon>
				<span>{{ t('windows.createProject.create') }}</span>
			</v-btn> -->
		</template>
	</SidebarWindow>
</template>

<script lang="ts" setup>
import SidebarWindow from '/@/components/Windows/Layout/SidebarWindow.vue'
import { useTranslations } from '../../Composables/useTranslations'
import { IStep } from './Step'

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.state
const sidebar = props.window.sidebar

function close() {
	props.window.close()
}

function getCurrentComponent(id: string) {
	return state.steps.find((step: IStep) => step.id === id)?.component
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
