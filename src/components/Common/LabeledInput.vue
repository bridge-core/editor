<template>
	<div
		class="border-2 rounded px-3 py-2 transition-colors duration-100 ease-out relative mt-3 select-none"
		:class="{
			'border-menu': !(_focused || focused),
			'border-primary': _focused || focused,
		}"
	>
		<span
			class="absolute -top-1/3 left-2 text-xs bg-inherit p-1 text-textAlternate font-inter"
			>{{ label }}</span
		>
		<slot
			:focus="() => (_focused = true)"
			:blur="() => (_focused = false)"
			:focused="_focused || focused"
		/>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const _focused = ref(false)

defineProps({
	label: {
		type: String,
	},
	focused: {
		type: Boolean,
		default: false,
	},
})
</script>
