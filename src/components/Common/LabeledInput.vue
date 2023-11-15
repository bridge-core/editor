<template>
	<div
		class="border-2 rounded px-3 py-2 transition-colors duration-100 ease-out relative mt-3"
		:class="{ 'border-menu': !focused, 'border-primary': focused }"
	>
		<span class="absolute -top-1/3 left-2 text-xs bg-background p-1">{{
			label
		}}</span>
		<slot :focus="() => (focused = true)" :blur="() => (focused = false)" />
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const focused = ref(false)

defineProps({
	label: {
		type: String,
	},
})
</script>
