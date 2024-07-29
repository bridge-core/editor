<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, Ref, ref } from 'vue'

const open = ref(false)
const element: Ref<HTMLElement> = <any>ref(null)
const menu: Ref<HTMLDivElement> = <any>ref(null)

let menuTop = 0

function show() {
	open.value = true

	updatePosition()
}

function hide() {
	open.value = false
}

const observer = new MutationObserver(
	function () {
		updatePosition()
	}.bind(this)
)

async function updatePosition() {
	if (!element.value) return
	if (!menu.value) return

	const elementRect = element.value.getBoundingClientRect()

	menu.value.style.left = `${elementRect.width}px`

	if (!open.value) return

	await nextTick()

	const menuRect = menu.value.getBoundingClientRect()

	menuTop = elementRect.top - (menuRect.top - menuTop)

	menu.value.style.top = `calc(${menuTop}px)`
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
		<div class="w-3 self-stretch" />

		<div class="bg-background-secondary rounded shadow-window">
			<slot name="menu" />
		</div>
	</div>
</template>
