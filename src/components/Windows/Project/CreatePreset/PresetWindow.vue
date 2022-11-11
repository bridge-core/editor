<template>
	<SidebarWindow
		v-if="state.shouldRender"
		windowTitle="windows.createPreset.title"
		:isVisible="state.isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:percentageWidth="80"
		:percentageHeight="80"
		@closeWindow="onClose"
		:sidebarItems="window.sidebar.elements"
		v-model="window.sidebar.selected"
	>
		<template #sidebar>
			<v-text-field
				class="pt-2"
				prepend-inner-icon="mdi-magnify"
				:label="t('windows.createPreset.searchPresets')"
				v-model.lazy.trim="window.sidebar.filter"
				autocomplete="off"
				autofocus
				outlined
				dense
				hide-details
			/>
			<v-switch
				:label="t('windows.createPreset.showAllPresets')"
				v-model="window.sidebar.showDisabled"
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

			<PresetPath
				v-if="typeof content.models.PRESET_PATH === 'string'"
				v-model="content.models.PRESET_PATH"
			/>

			<template v-for="([name, id, opts = {}], i) in content.fields">
				<v-text-field
					v-if="!opts.type || opts.type === 'textInput'"
					class="mb-1"
					:key="i"
					v-model="content.models[id]"
					:label="name"
					:rules="
						opts.validate
							? opts.validate.map(
									(rule) => window.validationRules[rule]
							  )
							: []
					"
					autocomplete="off"
					outlined
					dense
					@keypress.enter="onCreatePreset"
				/>
				<span
					v-else-if="opts.type === 'fileInput'"
					v-cloak
					:key="i"
					@drop.prevent.stop="onDropFile(id, opts, $event)"
					@dragover.prevent.stop
				>
					<v-file-input
						class="mb-1"
						v-model="content.models[id]"
						:accept="opts.accept"
						:prepend-icon="null"
						:prepend-inner-icon="opts.icon || 'mdi-paperclip'"
						:label="name"
						:multiple="opts.multiple || false"
						autocomplete="off"
						outlined
						dense
					/>
				</span>

				<component
					v-else-if="opts.type === 'selectInput'"
					:is="
						opts.options.length > 4 ? 'v-autocomplete' : 'v-select'
					"
					class="mb-1"
					:key="i"
					:loading="opts.isLoading"
					:disabled="opts.isLoading"
					v-model="content.models[id]"
					:items="opts.options"
					:menu-props="{
						maxHeight: 220,
						rounded: 'lg',
						'nudge-top': -8,
						transition: 'slide-y-transition',
					}"
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
			>
				<v-icon class="mr-1">mdi-plus</v-icon>
				Create
			</v-btn>
		</template>
	</SidebarWindow>
</template>

<script lang="ts" setup>
import SidebarWindow from '/@/components/Windows/Layout/SidebarWindow.vue'
import PresetPath from './PresetPath.vue'
import { isFileAccepted } from '/@/utils/file/isAccepted'
import { computed, toRefs } from 'vue'
import { useTranslations } from '/@/components/Composables/useTranslations'
import type { CreatePresetWindow } from './PresetWindow'

const props = defineProps<{
	window: CreatePresetWindow
}>()

const { t } = useTranslations()

const state = props.window.getState()
const content = computed(() => props.window.sidebar.currentState)
const fieldsReady = computed(() => {
	return (<[string, string, any][]>(
		Object.values(content.value.fields || {})
	)).every(([_, id, opts = {}]) => {
		if (
			opts.validate &&
			opts.validate.some(
				(rule: any) =>
					props.window.validationRules[rule](
						content.value.models[id]
					) !== true
			)
		)
			return false

		return (
			!!content.value.models[id] ||
			opts.optional ||
			opts.type === 'switch'
		)
	})
})

function onClose() {
	props.window.close()
}
function onCreatePreset() {
	if (fieldsReady.value) props.window.createPreset(content.value)
}
function onDropFile(id: string, opts: any, event: DragEvent) {
	const { accept, multiple } = opts
	const acceptedFiles = [...(event.dataTransfer?.files ?? [])].filter(
		(file) => isFileAccepted(file, accept)
	)
	if (acceptedFiles.length === 0) return

	if (multiple) {
		if (!content.value.models[id])
			content.value.models[id] = [...acceptedFiles]
		else content.value.models[id].push(...acceptedFiles)
	} else {
		content.value.models[id] = acceptedFiles[acceptedFiles.length - 1]
	}
}
</script>
