<script setup lang="ts">
import { onUnmounted, ref } from 'vue'

import { isElementOrChild } from '@/libs/element/Element'

const isOpen = ref(false)
const menu = ref<HTMLElement | null>(null)

function toggle() {
	isOpen.value = !isOpen.value

	if (isOpen.value) {
		window.addEventListener('mousedown', click)
	} else {
		window.removeEventListener('mousedown', click)
	}
}

function open() {
	if (isOpen.value) return

	isOpen.value = true

	window.addEventListener('mousedown', click)
}

function close() {
	if (!isOpen.value) return

	isOpen.value = false

	window.removeEventListener('mousedown', click)
}

function click(event: Event) {
	if (!menu.value) return
	if (event.target && !(event.target instanceof HTMLElement)) return

	if (isElementOrChild(event.target, menu.value)) return

	isOpen.value = false
}

onUnmounted(() => {
	if (!isOpen.value) return

	window.removeEventListener('mousedown', click)
})

defineExpose({ open, close })
</script>

<template>
	<div class="relative" ref="menu">
		<slot name="main" :toggle="toggle" />

		<div class="absolute">
			<Transition>
				<slot name="menu" v-if="isOpen" :close="toggle" />
			</Transition>
		</div>
	</div>
</template>

<style scoped>
.v-enter-active {
	transition: opacity 0.15s ease, scale 0.2s ease, translate 0.2s ease;
}

.v-leave-active {
	transition: opacity 0.15s ease, scale 0.2s ease, translate 0.2s ease;
}

.v-enter-to,
.v-leave-from {
	translate: 0px 0px;
	scale: 1;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
	translate: 0px -1rem;
	scale: 0.95;
}
</style>
