<script setup lang="ts">
/**
 * Provides a way for us to embed a SolidJS component inside of our Vue app
 */
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { render } from 'solid-js/web'
import type { JSX } from 'solid-js/types'

const props = defineProps<{
	component: () => JSX.Element
}>()
const mountRef = ref<HTMLElement | null>(null)

let dispose: (() => void) | null = null
onMounted(() => {
	if (!mountRef.value) return

	dispose = render(props.component, mountRef.value)
})

onBeforeUnmount(() => {
	if (dispose) dispose()
})
</script>

<template>
	<div ref="mountRef"></div>
</template>
