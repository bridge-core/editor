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
		v-model.trim.lazy="window.selectedSidebar"
	>
		<template #sidebar>
			<v-text-field
				class="pt-2"
				prepend-inner-icon="mdi-magnify"
				:label="t('windows.extensionStore.searchExtensions')"
				v-model.lazy.trim="sidebar.filter"
				autocomplete="off"
				:autofocus="pointerDevice === 'mouse'"
				outlined
				dense
			/>
		</template>
		<template #default>
			<div v-if="currentExtensions.length === 0">
				No plugins match your search...
			</div>
			<template v-else>
				<ExtensionCard
					v-for="extension in currentExtensions"
					:key="`${extension.id}.${extension.isInstalled}.${extension.isUpdateAvailable}`"
					:extension="extension"
					@search="(search) => (sidebar.filter = search)"
					@select="(id) => (window.selectedSidebar = id)"
				/>
			</template>
		</template>
	</SidebarWindow>
</template>

<script lang="ts" setup>
import SidebarWindow from '/@/components/Windows/Layout/SidebarWindow.vue'
import ExtensionCard from './ExtensionCard.vue'
import { pointerDevice } from '/@/utils/pointerDevice'
import { useTranslations } from '../../Composables/useTranslations'
import { computed } from 'vue'

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.getState()
const sidebar = props.window.sidebar

const title = computed(() => {
	if (!sidebar.currentElement) return 'windows.extensionStore.title'
	else if (currentExtensions.value.length === 1)
		return `[${currentExtensions.value[0].name} - ${t(
			'windows.extensionStore.title'
		)}]`
	else
		return `[${sidebar.filter || sidebar.currentElement.text} - ${t(
			'windows.extensionStore.title'
		)}]`
})

const currentExtensions = computed(() => {
	if (sidebar.filter !== '') {
		const f = sidebar.filter.toLowerCase()

		return props.window.extensions.filter(
			(e: any) =>
				e.name.toLowerCase().includes(f) ||
				e.description.toLowerCase().includes(f) ||
				e.author.toLowerCase().includes(f) ||
				e.version.includes(f) ||
				e.id === sidebar.filter ||
				e.tags.some((tag: any) => tag.text.toLowerCase().includes(f))
		)
	}

	return sidebar.currentState
})

function onClose() {
	props.window.close()
}
</script>
