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
			<h1
				class="mt-2 d-flex align-center"
				:class="{ 'mb-6': !content.description }"
			>
				<v-icon class="mr-1" large>{{ content.icon }}</v-icon>
				{{ content.name }}
			</h1>
			<p v-if="content.description" class="mt-2 mb-6">
				{{ content.description }}
			</p>

			<v-text-field
				class="mb-1"
				v-for="([name, id], i) in content.fields"
				:key="i"
				:label="name"
				outlined
				dense
				v-model="content.models[id]"
			/>

			{{ content.models }}
		</template>

		<template #actions>
			<v-spacer />
			<v-btn
				@click="onCreatePreset"
				color="primary"
				:disabled="!fieldsReady"
				:loading="false"
			>
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
	computed: {
		content() {
			return this.sidebar.currentState
		},
		fieldsReady() {
			return Object.values(this.content.models || {}).every(val => !!val)
		},
	},
	methods: {
		onClose() {
			this.currentWindow.close()
		},
		onCreatePreset() {
			this.currentWindow.close()
			this.currentWindow.createPreset(this.content)
		},
	},
}
</script>
