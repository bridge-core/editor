<script setup lang="ts">
import Icon from '@/components/Common/Icon.vue'

defineProps({
	text: {
		type: String,
		required: true,
	},
})
</script>

<template>
	<div class="rounded border-2 border-primary p-2 table relative">
		<div class="absolute left-0 top-0 w-full h-full bg-primary opacity-10" />

		<div class="flex items-center gap-1">
			<Icon icon="info" class="text-base" />

			<span>{{ text }}</span>
		</div>
	</div>
</template>
