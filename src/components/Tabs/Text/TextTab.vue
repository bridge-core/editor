<script setup lang="ts">
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'

import { Ref, onMounted, onUnmounted, ref } from 'vue'
import { type TextTab } from './TextTab'
import { isElementOrChild } from '@/libs/element/Element'

const { instance }: { instance: TextTab } = <any>defineProps({
	instance: {
		required: true,
	},
})

const tabElement: Ref<HTMLDivElement | null> = ref(null)
const editorContainer: Ref<HTMLDivElement | null> = ref(null)
const editorElement: Ref<HTMLDivElement | null> = ref(null)

const contextMenu: Ref<HTMLDivElement | null> = ref(null)
const contextMenuOpen: Ref<boolean> = ref(false)
const contextMenuX: Ref<number> = ref(0)
const contextMenuY: Ref<number> = ref(0)

function showContextMenu(event: MouseEvent) {
	contextMenuOpen.value = true

	contextMenuX.value = event.clientX
	contextMenuY.value = event.clientY

	window.addEventListener('click', hideContextMenu)
}

function hideContextMenu(event: Event) {
	if (isElementOrChild(<HTMLElement>event.target, contextMenu.value!)) return

	window.removeEventListener('click', hideContextMenu)

	contextMenuOpen.value = false
}

const resizeObserver = new ResizeObserver((entries) => {
	if (!tabElement.value) return
	if (!editorContainer.value) return

	editorContainer.value.style.width =
		tabElement.value.getBoundingClientRect().width + 'px'

	editorContainer.value.style.height =
		tabElement.value.getBoundingClientRect().height + 'px'
})

onMounted(async () => {
	if (!tabElement.value) return
	if (!editorContainer.value) return
	if (!editorElement.value) return

	resizeObserver.observe(tabElement.value)

	await instance.mountEditor(editorElement.value)
})

onUnmounted(() => {
	if (!editorElement.value) return

	instance.unmountEditor()
})
</script>

<template>
	<div class="w-full h-full" ref="tabElement">
		<div class="absolute" ref="editorContainer">
			<div
				class="h-full"
				ref="editorElement"
				@contextmenu.prevent="showContextMenu"
			/>
		</div>

		<div
			v-if="contextMenuOpen"
			ref="contextMenu"
			class="w-56 bg-menuAlternate rounded shadow-window overflow-hidden z-10 absolute"
			:style="{
				left: contextMenuX + 'px',
				top: contextMenuY + 'px',
			}"
		>
			<ContextMenuItem text="Copy" icon="content_copy" />
			<ContextMenuItem text="Cut" icon="content_cut" />
			<ContextMenuItem text="Paste" icon="content_paste" />

			<div class="bg-menu h-px m-2" />

			<ContextMenuItem text="View Documentation" icon="menu_book" />
			<ContextMenuItem text="Format Document" icon="edit_note" />
			<ContextMenuItem text="Change All Occurances" icon="edit" />
			<ContextMenuItem text="Go to Definition" icon="search" />
			<ContextMenuItem text="Go to Symbol" icon="arrow_forward" />
		</div>
	</div>
</template>
