<template>
	<SidebarWindow
		windowTitle="windows.extensionStore.title"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:percentageWidth="80"
		:percentageHeight="80"
		@closeWindow="onClose"
		:sidebarItems="sidebar.elements"
		v-model="$data.selectedSidebar"
	>
		<template #sidebar>
			<v-text-field
				class="pt-2"
				prepend-inner-icon="mdi-magnify"
				:label="t('windows.extensionStore.searchExtensions')"
				v-model="sidebar._filter"
				autofocus
				outlined
				dense
			/>
		</template>
		<template #default>
			<div v-if="currentPlugins.length === 0">
				No plugins match your search...
			</div>
			<template v-else>
				<PluginCard
					v-for="plugin in currentPlugins"
					:key="plugin.id"
					:plugin="plugin"
					@search="search => (sidebar._filter = search)"
					@select="id => ($data.selectedSidebar = id)"
				/>
			</template>
		</template>
	</SidebarWindow>
</template>

<script>
import SidebarWindow from '@/components/Windows/Layout/SidebarWindow.vue'
import PluginCard from './PluginCard.vue'
import { TranslationMixin } from '@/utils/locales'

export default {
	name: 'CreatePresetWindow',
	mixins: [TranslationMixin],
	components: {
		SidebarWindow,
		PluginCard,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow
	},
	computed: {
		currentPlugins() {
			if (this.sidebar._filter !== '') {
				const f = this.sidebar._filter.toLowerCase()

				return this.plugins.filter(
					plugin =>
						plugin.name.toLowerCase().includes(f) ||
						plugin.description.toLowerCase().includes(f) ||
						plugin.author.toLowerCase().includes(f) ||
						plugin.version.includes(f) ||
						plugin.tags.some(tag =>
							tag.text.toLowerCase().includes(f)
						)
				)
			}

			return this.sidebar.currentState
		},
	},
	methods: {
		onClose() {
			this.currentWindow.close()
		},
	},
}
</script>
