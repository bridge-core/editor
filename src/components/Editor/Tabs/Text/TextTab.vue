<template>
	<div ref="editor" class="w-full h-full" />
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from 'vue'

defineProps({
	instance: {
		type: Object,
		required: true,
	},
})

const editor: Ref<HTMLDivElement | null> = ref(null)

onMounted(() => {})
</script>
