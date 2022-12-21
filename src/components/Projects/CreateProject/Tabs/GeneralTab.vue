<template>
	<div>
		<h2 class="mb-2">
			{{ t('windows.createProject.categories.general') }}
		</h2>

		<div class="d-flex">
			<div
				style="width: 40%"
				@drop.prevent.stop="onDropFile"
				@dragover.prevent.stop
			>
				<v-file-input
					v-model="state.createOptions.icon"
					:label="t('windows.createProject.packIcon')"
					:prepend-icon="null"
					prepend-inner-icon="mdi-image-outline"
					accept="image/png"
					class="mr-2"
					outlined
					dense
				/>
			</div>

			<v-text-field
				v-model="state.createOptions.name"
				:label="t('windows.createProject.projectName.name')"
				:rules="nameRules"
				autocomplete="off"
				class="ml-2"
				outlined
				dense
			/>
		</div>

		<v-textarea
			v-model="state.createOptions.description"
			:label="t('windows.createProject.projectDescription')"
			autocomplete="off"
			auto-grow
			rows="1"
			counter
			outlined
			dense
		/>

		<div class="d-flex">
			<v-text-field
				v-model="state.createOptions.namespace"
				:label="t('windows.createProject.projectPrefix')"
				autocomplete="off"
				class="mr-2"
				outlined
				dense
			/>
			<v-text-field
				v-model="state.createOptions.author"
				:label="t('windows.createProject.projectAuthor')"
				autocomplete="off"
				class="mx-2"
				outlined
				dense
			/>

			<v-autocomplete
				v-model="state.createOptions.targetVersion"
				:label="t('windows.createProject.projectTargetVersion')"
				autocomplete="off"
				:menu-props="{
					maxHeight: 220,
					rounded: 'lg',
					'nudge-top': -8,
					transition: 'slide-y-transition',
				}"
				:items="window.availableTargetVersions"
				:loading="state.availableTargetVersionsLoading"
				class="ml-2"
				outlined
				dense
			/>
		</div>

		<div class="d-flex flex-column">
			<v-switch
				inset
				dense
				:label="t('windows.createProject.useLangForManifest')"
				v-model="state.createOptions.useLangForManifest"
			></v-switch>
			<v-switch
				inset
				dense
				:label="t('windows.createProject.bdsProject')"
				v-model="state.createOptions.bdsProject"
			></v-switch>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { isFileAccepted } from '/@/utils/file/isAccepted'
import { useTranslations } from '/@/components/Composables/useTranslations'
import { computed } from 'vue'

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.state

const nameRules = computed(() => {
	return props.window.projectNameRules.map((rule: any) => (val: any) => {
		const res = rule(val)
		if (res === true) return true

		return t(res)
	})
})

function onDropFile(event: DragEvent) {
	const file = event.dataTransfer?.files[0]
	if (!file || !isFileAccepted(file, 'image/png')) return

	state.createOptions.icon = file
}
</script>
