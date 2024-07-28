<script setup lang="ts">
import { onMounted, onUnmounted, Ref, ref } from 'vue'

const open = ref(false)
const element: Ref<HTMLElement> = <any>ref(null)
const menu: Ref<HTMLDivElement> = <any>ref(null)

function show() {
	open.value = true
}

function hide() {
	open.value = false
}

const observer = new MutationObserver(
	function () {
		updatePosition()
	}.bind(this)
)

function updatePosition() {
	if (!element.value) return
	if (!menu.value) return

	const rect = element.value.getBoundingClientRect()

	menu.value.style.left = `calc(${rect.width}px)`
}

onMounted(() => {
	updatePosition()

	if (!element.value) return

	observer.observe(element.value, {
		childList: true,
		subtree: true,
		attributes: true,
		characterData: true,
	})
})

onUnmounted(() => {
	observer.disconnect()
})
</script>

<template>
	<span ref="element">
		<slot name="main" :show="show" :hide="hide" />
	</span>

	<div v-show="open" ref="menu" class="z-10 absolute top-0 flex" @mouseenter="show" @mouseleave="hide">
		<div class="w-5" />

		<div class="bg-background-secondary rounded shadow-window">
			<slot name="menu" />
		</div>
	</div>
</template>
