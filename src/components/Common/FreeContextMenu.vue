<script setup lang="ts">
import { isElementOrChild } from '@/libs/element/Element'
import { Ref, nextTick, onUnmounted, ref, watch } from 'vue'
import { openContextMenuId } from './FreeContextMenu'
import { v4 as uuid } from 'uuid'

const contextMenuElement: Ref<HTMLDivElement | null> = ref(null)
const isOpen: Ref<boolean> = ref(false)
const x: Ref<number> = ref(0)
const y: Ref<number> = ref(0)

const id = uuid()

watch(openContextMenuId, () => {
	if (openContextMenuId.value === id) return

	if (!isOpen.value) return

	window.removeEventListener('click', hideContextMenu)

	isOpen.value = false
})

function hideContextMenu(event: Event) {
	if (isElementOrChild(<HTMLElement>event.target, contextMenuElement.value!))
		return

	window.removeEventListener('click', hideContextMenu)

	isOpen.value = false
}

async function open(event: MouseEvent) {
	x.value = event.clientX
	y.value = event.clientY

	if (isOpen.value) {
		isOpen.value = false

		await nextTick()

		isOpen.value = true

		return
	}

	openContextMenuId.value = id

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
	<Transition>
		<div
			v-if="isOpen"
			ref="contextMenuElement"
			class="bg-menuAlternate rounded shadow-window overflow-hidden z-10 absolute"
			:style="{
				left: x + 'px',
				top: y + 'px',
			}"
			@contextmenu.stop.prevent=""
		>
			<slot />
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
	translate: 0px 1rem;
	scale: 0.95;
}
</style>
