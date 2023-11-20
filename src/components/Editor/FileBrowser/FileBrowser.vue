<template>
	<div
		class="self-stretch my-2 w-96 flex flex-col gap-2"
		v-if="instance.open.value"
	>
		<div class="bg-menuAlternate rounded h-16 flex items-center p-3 gap-3">
			<img :src="currentProject?.icon" class="w-10 h-10" />
			<p class="text-3xl">{{ currentProject?.name }}</p>
		</div>
		<div class="bg-menuAlternate rounded flex-1"></div>
	</div>
</template>

<script setup lang="ts">
import { App } from '/@/App'
import { FileBrowser } from './FileBrowser'

const currentProject = App.instance.projectManager.useCurrentProject()

defineProps({
	instance: {
		type: FileBrowser,
		required: true,
	},
})
</script>
