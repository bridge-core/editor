<template>
	<span
		v-if="diagnostic"
		class="font-thin text-xs opacity-50"
		:class="{
			'text-error': diagnostic.severity === 'error',
			'text-warning': diagnostic.severity === 'warning',
			'text-info': diagnostic.severity === 'info',
		}"
	>
		{{ diagnostic.message }}
	</span>
</template>

<script setup lang="ts">
const props = defineProps<{
	diagnostic: {
		message: string
		severity: 'error' | 'warning' | 'info'
	}
}>()
</script>
