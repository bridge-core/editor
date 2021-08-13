<template>
	<SidebarWindow
		:windowTitle="`[${
			this.sidebar._filter || this.sidebar.currentElement.text
		} - ${t('windows.extensionStore.title')}]`"
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
				autocomplete="off"
				autofocus
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
					@search="(search) => (sidebar._filter = search)"
					@select="(id) => ($data.selectedSidebar = id)"
				/>
			</template>
		</template>
	</SidebarWindow>
</template>

<script>
import SidebarWindow from '/@/components/Windows/Layout/SidebarWindow.vue'
import ExtensionCard from './ExtensionCard.vue'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'

export default {
	name: 'CreatePresetWindow',
	mixins: [TranslationMixin],
	components: {
		SidebarWindow,
		ExtensionCard,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow
	},
	computed: {
		currentExtensions() {
			if (this.sidebar._filter !== '') {
				const f = this.sidebar._filter.toLowerCase()

				return this.extensions.filter(
					(e) =>
						e.name.toLowerCase().includes(f) ||
						e.description.toLowerCase().includes(f) ||
						e.author.toLowerCase().includes(f) ||
						e.version.includes(f) ||
						e.tags.some((tag) => tag.text.toLowerCase().includes(f))
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
