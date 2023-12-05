<template>
	<div
		class="cursor-pointer w-60 rounded bg-[var(--color)] hover:border-text p-2 border-2 transition-colors duration-100 ease-out"
		:class="{
			'!border-primary': selected,
			'border-[var(--color)]': !selected,
		}"
		:style="{
			'--color': `var(--theme-color-${background})`,
		}"
	>
		<div class="flex items-center gap-1 mb-2">
			<Icon :icon="icon" :color="color" />
			<p class="select-none text-lg font-inter font-medium">
				{{ name }}
			</p>
		</div>

		<div class="flex align-center mb-2">
			<Icon
				:icon="selected ? 'task_alt' : 'circle'"
				:color="selected ? 'success' : 'textAlternate'"
				class="text-base mr-1"
				:class="{ 'no-fill': !selected }"
			/>
			<span class="text-textAlternate select-none font-inter"
				>Active</span
			>
		</div>

		<p class="text-sm select-none text-textAlternate font-inter">
			{{ description }}
		</p>

		<slot />
	</div>
</template>

<script setup lang="ts">
import Icon from '@/components/Common/Icon.vue'

defineProps({
	name: {
		type: String,
		required: true,
	},
	icon: {
		type: String,
		required: true,
	},
	color: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	selected: {
		type: Boolean,
		required: true,
	},
	background: {
		type: String,
		default: 'menuAlternate',
	},
})
</script>
