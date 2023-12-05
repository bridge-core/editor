<template>
	<div ref="editor" class="w-full h-full" />
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from 'vue'

const { instance } = defineProps({
	instance: {
		type: Object,
		required: true,
	},
})

const editor: Ref<HTMLDivElement | null> = ref(null)

onMounted(() => {
	if (!editor.value) return

	instance.addEditor(editor.value)
})
</script>
