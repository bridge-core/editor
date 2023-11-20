<template>
	<div class="flex items-center gap-1">
		<Icon icon="folder" :color="color" class="text-sm" />

		<span> {{ name }} </span>
	</div>
</template>

<script setup lang="ts">
import Icon from '/@/components/Common/Icon.vue'

defineProps({
	name: {
		type: String,
		required: true,
	},
	color: {
		type: String,
		default: 'text',
	},
})
</script>
