<script setup lang="ts">
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'
import TreeEditorObjectElement from './TreeEditorContainerElement.vue'

import { Ref, onMounted, onUnmounted, ref } from 'vue'
import { type TreeEditorTab } from './TreeEditorTab'
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'
import { ActionManager } from '@/libs/actions/ActionManager'

const { instance }: { instance: TreeEditorTab } = <any>defineProps({
	instance: {
		required: true,
	},
})

const tabElement: Ref<HTMLDivElement | null> = ref(null)

const contextMenu: Ref<typeof FreeContextMenu | null> = ref(null)

function triggerActionAndCloseContextMenu(action: string) {
	ActionManager.trigger(action)

	contextMenu.value?.close()
}

//@contextmenu.prevent="contextMenu?.open"
</script>

<template>
	<div class="w-full h-full" ref="tabElement">
		<div class="h-full w-full" ref="editorContainer">
			<TreeEditorObjectElement :editor="instance" :tree="instance.tree" />
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
				v-if="instance.hasDocumentation.value"
				text="View Documentation"
				icon="menu_book"
				@click="triggerActionAndCloseContextMenu('viewDocumentation')"
			/>
			<ContextMenuItem text="Format" icon="edit_note" @click="triggerActionAndCloseContextMenu('format')" />
			<ContextMenuItem
				v-if="instance.language.value !== 'json'"
				text="Change All Occurences"
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
