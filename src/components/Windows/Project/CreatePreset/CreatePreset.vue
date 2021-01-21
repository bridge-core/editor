<template>
	<SidebarWindow
		windowTitle="windows.createPreset.title"
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
				:label="t('windows.createPreset.searchPresets')"
				v-model="sidebar._filter"
				outlined
				dense
			/>
		</template>
		<template #default>
			Test
		</template>

		<template #actions>
			<v-spacer />
			<v-btn color="primary" :loading="false">
				Create
			</v-btn>
		</template>
	</SidebarWindow>
</template>

<script>
import SidebarWindow from '@/components/Windows/Layout/SidebarWindow.vue'

import { TranslationMixin } from '@/utils/locales'

export default {
	name: 'CreatePresetWindow',
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
