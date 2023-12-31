<script setup lang="ts">
import { onUnmounted, ref } from 'vue'

import { isElementOrChild } from '@/libs/element/Element'

const isOpen = ref(false)
const menu = ref<HTMLElement | null>(null)

function toggle() {
	isOpen.value = !isOpen.value

	if (isOpen.value) {
		window.addEventListener('click', click)
	} else {
		window.removeEventListener('click', click)
	}
}

function open() {
	if (isOpen.value) return

	isOpen.value = true

	window.addEventListener('click', click)
}

function close() {
	if (!isOpen.value) return

	isOpen.value = false

	window.removeEventListener('click', click)
}

function click(event: Event) {
	if (!menu.value) return
	if (event.target && !(event.target instanceof HTMLElement)) return

	if (isElementOrChild(event.target, menu.value)) return

	isOpen.value = false
}

onUnmounted(() => {
	if (!isOpen.value) return

	window.removeEventListener('click', click)
})

defineExpose({ open, close })
</script>

<template>
	<div class="relative" ref="menu">
		<slot name="main" :toggle="toggle" />

		<div class="absolute">
			<slot name="menu" v-if="isOpen" :close="toggle" />
		</div>
	</div>
</template>
