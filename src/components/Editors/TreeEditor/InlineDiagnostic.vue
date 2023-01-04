<template>
	<span
		v-if="diagnostic"
		class="ml-4 d-inline-flex items-center font-thin text-xs opacity-50"
		:class="{
			'text-error': diagnostic.severity === 'error',
			'text-warning': diagnostic.severity === 'warning',
			'text-info': diagnostic.severity === 'info',
		}"
	>
		<v-icon :color="diagnostic.severity" class="mr-1" small>
			mdi-arrow-down
		</v-icon>
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
