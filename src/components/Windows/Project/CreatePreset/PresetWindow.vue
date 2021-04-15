<template>
	<SidebarWindow
		v-if="shouldRender"
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
				autocomplete="off"
				autofocus
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

			<template v-for="([name, id, opts = {}], i) in content.fields">
				<v-text-field
					v-if="!opts.type || opts.type === 'textInput'"
					class="mb-1"
					:key="i"
					v-model="content.models[id]"
					:label="name"
					autocomplete="off"
					outlined
					dense
					@keypress.enter="onCreatePreset"
				/>
				<v-file-input
					v-else-if="opts.type === 'fileInput'"
					class="mb-1"
					:key="i"
					v-model="content.models[id]"
					:accept="opts.accept"
					:prepend-icon="null"
					:prepend-inner-icon="opts.icon || 'mdi-paperclip'"
					:label="name"
					autocomplete="off"
					outlined
					dense
				/>

				<component
					v-else-if="opts.type === 'selectInput'"
					:is="
						opts.options.length > 4 ? 'v-autocomplete' : 'v-select'
					"
					class="mb-1"
					:key="i"
					v-model="content.models[id]"
					:items="opts.options"
					:menu-props="{ maxHeight: 220 }"
					:label="name"
					autocomplete="off"
					outlined
					dense
				/>

				<v-switch
					v-else-if="opts.type === 'switch'"
					class="mb-1"
					:key="i"
					v-model="content.models[id]"
					:label="name"
				/>

				<v-slider
					v-else-if="opts.type === 'numberInput'"
					class="mb-1"
					:key="i"
					v-model="content.models[id]"
					:min="opts.min || 0"
					:max="opts.max || 10"
					discrete
					:step="opts.step || 1"
					thumb-label="always"
					:label="name"
				/>
			</template>
		</template>

		<template #actions>
			<v-spacer />
			<v-btn
				@click="onCreatePreset"
				color="primary"
				:disabled="!fieldsReady"
				:loading="!isPackIndexerReady"
			>
				<v-icon class="mr-1">mdi-plus</v-icon>
				Create
			</v-btn>
		</template>
	</SidebarWindow>
</template>

<script>
import SidebarWindow from '/@/components/Windows/Layout/SidebarWindow.vue'

import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import { PackIndexerMixin } from '/@/components/Mixins/Tasks/PackIndexer'

export default {
	name: 'CreatePresetWindow',
	mixins: [TranslationMixin, PackIndexerMixin],
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
			return Object.values(this.content.fields || {}).every(
				([_, id, opts = {}]) =>
					!!this.content.models[id] || opts.optional
			)
		},
	},
	methods: {
		onClose() {
			this.currentWindow.close()
		},
		onCreatePreset() {
			if (this.fieldsReady) this.currentWindow.createPreset(this.content)
		},
	},
}
</script>
