<template>
	<p>{{ instance.id }}</p>
</template>

<script setup lang="ts">
defineProps({
	instance: {
		type: Object,
		required: true,
	},
})
</script>
