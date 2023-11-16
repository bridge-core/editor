<template>
	<div
		class="cursor-pointer hover:border-text w-48 h-36 bg-menu rounded p-2 border-2 border-menu transition-colors duration-100 ease-out"
		:class="{ '!border-primary': selected }"
	>
		<div class="flex gap-1 mb-4">
			<Icon :icon="packType.icon" :color="packType.color" />
			<p class="select-none">{{ t(`packType.${packType.id}.name`) }}</p>
		</div>

		<p class="text-sm select-none">
			{{ t(`packType.${packType.id}.description`) }}
		</p>
	</div>
</template>

<script setup lang="ts">
import Icon from '/@/components/Common/Icon.vue'

import { translate as t } from '/@/libs/Locales/Locales'

const { packType } = defineProps({
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
