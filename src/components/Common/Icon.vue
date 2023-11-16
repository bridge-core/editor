<template>
	<span class="material-symbols-rounded text-text select-none">
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
