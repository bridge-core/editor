<template>
	<span class="material-symbols-rounded text-text">
		{{ icon }}
	</span>
</template>

<script setup lang="ts">
defineProps({
	icon: {
		type: String,
		required: true,
	},
})
</script>
