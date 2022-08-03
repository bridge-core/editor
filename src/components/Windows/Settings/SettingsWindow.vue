<template>
	<SidebarWindow
		:windowTitle="title"
		:isVisible="state.isVisible"
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
				v-model.lazy.trim="sidebar.filter"
				autocomplete="off"
				:autofocus="pointerDevice === 'mouse'"
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
				:key="`${selectedSidebar}.${i}.${control.value}`"
				:is="control.component"
				:config="control.config"
				:value="control.value"
				@change="control.onChange"
				@closeWindow="onClose"
			/>
		</template>
	</SidebarWindow>
</template>

<script lang="ts" setup>
import SidebarWindow from '/@/components/Windows/Layout/SidebarWindow.vue'
import { pointerDevice } from '/@/utils/pointerDevice'
import { useTranslations } from '../../Composables/useTranslations'
import { computed } from 'vue'

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.getState()
const sidebar = props.window.sidebar

const title = computed(() => {
	if (!sidebar.currentElement) return 'windows.settings.title'
	else
		return `[${sidebar.currentElement.text} - ${t(
			'windows.settings.title'
		)}]`
})

function onClose() {
	props.window.close()
}
</script>
