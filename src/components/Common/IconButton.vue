<template>
	<Icon class="cursor-pointer hover:text-primary transition-colors duration-100 ease-out" :icon="icon" />
</template>

<script setup lang="ts">
import Icon from './Icon.vue'

defineProps({
	icon: {
		type: String,
		required: true,
	},
})
</script>
