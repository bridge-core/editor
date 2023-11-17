<template>
	<div
		class="cursor-pointer hover:border-text w-60 bg-menuAlternate rounded p-2 border-2 border-menuAlternate transition-colors duration-100 ease-out"
		:class="{ '!border-primary': selected }"
	>
		<div class="flex items-center gap-1 mb-2">
			<Icon :icon="packType.icon" :color="packType.color" />
			<p class="select-none text-lg">
				{{ t(`packType.${packType.id}.name`) }}
			</p>
		</div>

		<div class="flex align-center mb-2">
			<Icon
				:icon="selected ? 'task_alt' : 'circle'"
				:color="selected ? 'success' : 'textAlternate'"
				class="text-base mr-1"
				:class="{ 'no-fill': !selected }"
			/>
			<span class="text-textAlternate">Active</span>
		</div>

		<p class="text-sm select-none text-textAlternate">
			{{ t(`packType.${packType.id}.description`) }}
		</p>

		<slot />
	</div>
</template>

<script setup lang="ts">
import Icon from '/@/components/Common/Icon.vue'

import { translate as t } from '/@/libs/locales/Locales'

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
