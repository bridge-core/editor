<script setup lang="ts">
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'

import { Ref, onMounted, onUnmounted, ref } from 'vue'
import { type TextTab } from './TextTab'
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'
import { ActionManager } from '@/libs/actions/ActionManager'

const { instance }: { instance: TextTab } = <any>defineProps({
	instance: {
		required: true,
	},
})

const tabElement: Ref<HTMLDivElement | null> = ref(null)
const editorContainer: Ref<HTMLDivElement | null> = ref(null)
const editorElement: Ref<HTMLDivElement | null> = ref(null)

const contextMenu: Ref<typeof FreeContextMenu | null> = ref(null)

const resizeObserver = new ResizeObserver(() => {
	if (!tabElement.value) return
	if (!editorContainer.value) return

	editorContainer.value.style.width = tabElement.value.getBoundingClientRect().width + 'px'

	editorContainer.value.style.height = tabElement.value.getBoundingClientRect().height + 'px'
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

function triggerActionAndCloseContextMenu(action: string) {
	ActionManager.trigger(action)

	contextMenu.value?.close()
}
</script>

<template>
	<div class="w-full h-full" ref="tabElement">
		<div class="absolute" ref="editorContainer">
			<div class="h-full" ref="editorElement" @contextmenu.prevent="contextMenu?.open" />
		</div>

		<FreeContextMenu class="w-56" ref="contextMenu">
			<ContextMenuItem
				text="Copy"
				icon="content_copy"
				class="pt-4"
				@click="triggerActionAndCloseContextMenu('copy')"
			/>
			<ContextMenuItem text="Cut" icon="content_cut" @click="triggerActionAndCloseContextMenu('cut')" />
			<ContextMenuItem text="Paste" icon="content_paste" @click="triggerActionAndCloseContextMenu('paste')" />

			<div class="bg-background-tertiary h-px m-2 my-0" />

			<ContextMenuItem text="Save" icon="save" @click="triggerActionAndCloseContextMenu('save')" />

			<div class="bg-background-tertiary h-px m-2 my-0" />

			<ContextMenuItem
				text="View Documentation"
				icon="menu_book"
				@click="triggerActionAndCloseContextMenu('viewDocumentation')"
			/>
			<ContextMenuItem text="Format" icon="edit_note" @click="triggerActionAndCloseContextMenu('format')" />
			<ContextMenuItem
				v-if="instance.language.value !== 'json'"
				text="Change All Occurances"
				icon="edit"
				@click="triggerActionAndCloseContextMenu('changeAllOccurrences')"
			/>
			<ContextMenuItem
				v-if="instance.language.value !== 'json'"
				text="Go to Definition"
				icon="search"
				@click="triggerActionAndCloseContextMenu('goToDefinition')"
			/>
			<ContextMenuItem
				text="Go to Symbol"
				icon="arrow_forward"
				class="pb-4"
				@click="triggerActionAndCloseContextMenu('goToSymbol')"
			/>
		</FreeContextMenu>
	</div>
</template>
