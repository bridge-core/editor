<template>
	<span
		class="material-symbols-rounded text-text cursor-pointer select-none hover:text-primary transition-colors duration-100 ease-out"
	>
		{{ icon }}
	</span>
</template>

<script setup lang="ts">
defineProps({
	icon: String,
})
</script>
