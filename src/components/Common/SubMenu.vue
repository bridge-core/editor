<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, Ref, ref } from 'vue'
import { v4 as uuid } from 'uuid'

const open = ref(false)
const element: Ref<HTMLElement> = <any>ref(null)
const menu: Ref<HTMLDivElement> = <any>ref(null)
const basis: Ref<HTMLElement> = <any>ref(null)

let lastOpenRequestId = ''

function show() {
	lastOpenRequestId = uuid()

	open.value = true

	updatePosition()
}

function hide() {
	const requestId = uuid()
	lastOpenRequestId = requestId

	setTimeout(() => {
		if (requestId !== lastOpenRequestId) return

		open.value = false
	}, 1)
}

const observer = new MutationObserver(
	function () {
		updatePosition()
	}.bind(this)
)

async function updatePosition() {
	if (!element.value) return
	if (!menu.value) return
	if (!basis.value) return

	const elementRect = element.value.getBoundingClientRect()

	menu.value.style.left = `${elementRect.width}px`

	if (!open.value) return

	await nextTick()

	const basisRect = basis.value.getBoundingClientRect()

	const menuTop = elementRect.top - basisRect.top

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

	<div ref="basis" class="absolute top-0" />

	<Transition>
		<div v-show="open" ref="menu" class="z-10 absolute top-0 flex" @mouseenter="show" @mouseleave="hide">
			<div class="w-2 self-stretch" />

			<div class="bg-background-secondary rounded shadow-window">
				<slot name="menu" />
			</div>
		</div>
	</Transition>
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
