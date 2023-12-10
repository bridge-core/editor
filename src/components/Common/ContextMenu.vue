<script setup lang="ts">
import { onUnmounted, ref } from 'vue'

const open = ref(false)
const menu = ref<HTMLElement | null>(null)

function toggle() {
	open.value = !open.value

	if (open.value) {
		window.addEventListener('click', click)
	} else {
		window.removeEventListener('click', click)
	}
}

function isElementOrChild(element: HTMLElement | null, target: HTMLElement) {
	while (element) {
		if (element === target) return true

		element = element.parentElement
	}

	return false
}

function click(event: Event) {
	if (!menu.value) return
	if (event.target && !(event.target instanceof HTMLElement)) return

	if (isElementOrChild(event.target, menu.value)) return

	open.value = false
}

onUnmounted(() => {
	if (!open.value) return

	window.removeEventListener('click', click)
})
</script>

<template>
	<div class="relative" ref="menu">
		<slot name="main" :toggle="toggle" />

		<div class="absolute">
			<slot name="menu" v-if="open" :close="toggle" />
		</div>
	</div>
</template>
