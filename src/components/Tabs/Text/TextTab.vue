<script setup lang="ts">
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'

import { Ref, onMounted, onUnmounted, ref } from 'vue'
import { type TextTab } from './TextTab'
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'
import { Actions } from '@/libs/actions/Actions'

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
</script>

<template>
	<div class="w-full h-full" ref="tabElement">
		<div class="absolute" ref="editorContainer">
			<div class="h-full" ref="editorElement" @contextmenu.prevent="contextMenu?.open" />
		</div>

		<FreeContextMenu class="w-56" ref="contextMenu">
			<ContextMenuItem text="Copy" icon="content_copy" class="pt-4" @click="Actions.trigger('copy')" />
			<ContextMenuItem text="Cut" icon="content_cut" @click="Actions.trigger('cut')" />
			<ContextMenuItem text="Paste" icon="content_paste" @click="Actions.trigger('paste')" />

			<div class="bg-menu h-px m-2" />

			<ContextMenuItem text="View Documentation" icon="menu_book" @click="Actions.trigger('viewDocumentation')" />
			<ContextMenuItem text="Format Document" icon="edit_note" @click="Actions.trigger('formatDocumentation')" />
			<ContextMenuItem text="Change All Occurances" icon="edit" @click="Actions.trigger('changeAllOccurances')" />
			<ContextMenuItem text="Go to Definition" icon="search" @click="Actions.trigger('goToDefinition')" />
			<ContextMenuItem
				text="Go to Symbol"
				icon="arrow_forward"
				class="pb-4"
				@click="Actions.trigger('goToSymbol')"
			/>
		</FreeContextMenu>
	</div>
</template>
