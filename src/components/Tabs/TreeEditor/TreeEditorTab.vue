<script setup lang="ts">
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'
import TreeEditorObjectElement from './EditorElements/TreeEditorContainerElement.vue'
import LabeledTextInput from '@/components/Common/LabeledTextInput.vue'

import { computed, Ref, ref, watch } from 'vue'
import { type TreeEditorTab } from './TreeEditorTab'
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'
import { ActionManager } from '@/libs/actions/ActionManager'
import { useTranslate } from '@/libs/locales/Locales'
import TextButton from '@/components/Common/TextButton.vue'
import { ModifyPropertyKeyEdit, ModifyValueEdit, ObjectElement, ValueElement } from './Tree'

const t = useTranslate()

const props = defineProps<{ instance: TreeEditorTab }>()

const tabElement: Ref<HTMLDivElement | null> = ref(null)

const contextMenu: Ref<typeof FreeContextMenu | null> = ref(null)

function triggerActionAndCloseContextMenu(action: string) {
	ActionManager.trigger(action)

	contextMenu.value?.close()
}

//@contextmenu.prevent="contextMenu?.open"

const addValue = ref('')

const editValue = computed<string>({
	get() {
		const selectedTree = props.instance.selectedTree.value

		if (!selectedTree) return ''

		if (selectedTree.tree instanceof ValueElement) return selectedTree.tree.value?.toString() ?? 'null'

		if (selectedTree.tree instanceof ObjectElement) return selectedTree.key?.toString() ?? ''

		return ''
	},
	set(newValue) {
		if (!props.instance.selectedTree.value) return

		if (props.instance.selectedTree.value.tree instanceof ValueElement) {
			props.instance.edit(new ModifyValueEdit(props.instance.selectedTree.value.tree, newValue))

			return
		}

		const key = props.instance.selectedTree.value.key

		if (!key) return

		if (props.instance.selectedTree.value.tree instanceof ObjectElement) {
			props.instance.edit(
				new ModifyPropertyKeyEdit(props.instance.selectedTree.value.tree, <string>key, newValue)
			)

			return
		}
	},
})

watch(props.instance.selectedTree, (selectedTree) => {})

watch(editValue, async (value) => {})
</script>

<template>
	<div class="w-full h-full" ref="tabElement">
		<div class="h-full w-full flex flex-col" ref="editorContainer">
			<div class="w-full flex-1 overflow-auto">
				<TreeEditorObjectElement :editor="instance" :tree="instance.tree.value" />
			</div>

			<div class="border-background-secondary border-t-2 w-full h-56 p-2">
				<div class="flex items-center gap-4 mt-3">
					<LabeledTextInput label="Add" v-model="addValue" class="flex-1 !mt-0" />

					<TextButton text="abc" />

					<LabeledTextInput label="Edit" v-model="editValue" class="flex-1 !mt-0" />
				</div>
			</div>
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
