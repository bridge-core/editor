<template>
	<Icon class="transition-colors duration-100 ease-out" :class="{ 'opacity-40': !enabled, 'cursor-pointer hover:text-primary': enabled }" :icon="icon" />
</template>

<script setup lang="ts">
import Icon from './Icon.vue'

withDefaults(defineProps<{ icon: string; enabled?: boolean }>(), {
	enabled: true,
})
</script>
