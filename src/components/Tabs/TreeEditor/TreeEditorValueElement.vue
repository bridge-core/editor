<script lang="ts" setup>
defineProps({
	value: {
		type: Object,
		required: true,
	},
})
</script>

<template>
	<span v-if="typeof value === 'object'">{...}</span>
	<span v-else-if="typeof value === 'string'">"{{ value }}"</span>
	<span v-else>{{ value }}</span>
</template>
