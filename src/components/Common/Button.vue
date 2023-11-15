<template>
	<button
		class="bg-menu px-2 py-1 rounded hover:bg-primary transition-colors duration-100 ease-out"
	>
		{{ text }}
	</button>
</template>

<script setup lang="ts">
defineProps({
	text: {
		type: String,
		required: true,
	},
})
</script>
