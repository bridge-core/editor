<script setup lang="ts">
import { isElementOrChild } from '@/libs/element/Element'
import { Ref, onUnmounted, ref } from 'vue'

const contextMenuElement: Ref<HTMLDivElement | null> = ref(null)
const isOpen: Ref<boolean> = ref(false)
const x: Ref<number> = ref(0)
const y: Ref<number> = ref(0)

function hideContextMenu(event: Event) {
	if (isElementOrChild(<HTMLElement>event.target, contextMenuElement.value!))
		return

	window.removeEventListener('click', hideContextMenu)

	isOpen.value = false
}

function open(event: MouseEvent) {
	x.value = event.clientX
	y.value = event.clientY

	if (isOpen.value) return

	isOpen.value = true

	window.addEventListener('click', hideContextMenu)
}

onUnmounted(() => {
	if (!isOpen.value) return

	window.removeEventListener('click', hideContextMenu)
})

defineExpose({ open })
</script>

<template>
	<div
		v-if="isOpen"
		ref="contextMenuElement"
		class="bg-menuAlternate rounded shadow-window overflow-hidden z-10 absolute"
		:style="{
			left: x + 'px',
			top: y + 'px',
		}"
	>
		<slot />
	</div>
</template>
