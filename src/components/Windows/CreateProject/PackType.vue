<template>
	<div
		class="w-32 h-32 bg-menu rounded p-2 border-2 border-menu transition-colors duration-100 ease-out"
		:class="{ 'border-primary': selected }"
	>
		<p class="select-none">{{ t(`packType.${packType.id}.name`) }}</p>
	</div>
</template>

<script setup lang="ts">
import { translate as t } from '/@/libs/Locales/Locales'

defineProps({
	packType: {
		type: Object as any,
		required: true,
	},
	selected: {
		type: Boolean,
		required: true,
	},
})
</script>
