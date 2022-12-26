<template>
	<SidebarWindow
		v-if="state.shouldRender"
		:windowTitle="state.windowTitle"
		:isVisible="state.isVisible"
		:hasMaximizeButton="false"
		:hasCloseButton="true"
		:isFullscreen="false"
		:isPersistent="state.isCreatingProject"
		:percentageWidth="90"
		:percentageHeight="90"
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
			<h1>{{ getCurrentStep().name }}</h1>
			<v-divider class="my-3" />
			<component
				:is="getCurrentStep().component"
				:window="window"
				:state="state"
			/>
		</template>

		<template #actions>
			<!--Next button-->
			<!--TODO: translate this-->
			<v-btn color="primary" @click="sidebar.selectNext()">
				Next
				<v-icon>mdi-chevron-right</v-icon>
			</v-btn>
			<v-spacer />

			<!--Confirm button-->
			<v-btn
				:color="state.confirm.color ?? 'primary'"
				:disabled="state.confirm.isDisabled.value"
				@click="state.confirm.onConfirm()"
			>
				<v-icon v-if="state.confirm.icon" class="pr-2">{{
					state.confirm.icon
				}}</v-icon>
				<span>{{ state.confirm.name }}</span>
			</v-btn>
		</template>
	</SidebarWindow>
</template>

<script lang="ts" setup>
import SidebarWindow from '/@/components/Windows/Layout/SidebarWindow.vue'
import { useTranslations } from '../../Composables/useTranslations'
import { IStep } from './Step'

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.getState()
const sidebar = props.window.sidebar

function close() {
	props.window.close()
}

function getCurrentStep() {
	return state.steps.find((step: IStep) => step.id === sidebar.selected)
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
