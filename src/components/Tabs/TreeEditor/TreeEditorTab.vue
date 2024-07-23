<script setup lang="ts">
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'
import TreeEditorPropertyElement from './EditorElements/TreeEditorPropertyElement.vue'
import LabeledTextInput from '@/components/Common/LabeledTextInput.vue'

import { computed, nextTick, onMounted, Ref, ref, watch } from 'vue'
import { type TreeEditorTab } from './TreeEditorTab'
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'
import { ActionManager } from '@/libs/actions/ActionManager'
import { useTranslate } from '@/libs/locales/Locales'
import TextButton from '@/components/Common/TextButton.vue'
import {
	AddElementEdit,
	AddPropertyEdit,
	ArrayElement,
	ModifyPropertyKeyEdit,
	ModifyValueEdit,
	ObjectElement,
	ValueElement,
} from './Tree'

const t = useTranslate()

const props = defineProps<{ instance: TreeEditorTab }>()

const tabElement: Ref<HTMLDivElement | null> = ref(null)

const contextMenu: Ref<typeof FreeContextMenu | null> = ref(null)

function triggerActionAndCloseContextMenu(action: string) {
	ActionManager.trigger(action)

	contextMenu.value?.close()
}

//@contextmenu.prevent="contextMenu?.open"

const _addValue = ref('')

const addValue = computed<string>({
	get() {
		return _addValue.value
	},
	async set(newValue) {
		_addValue.value = newValue

		if (!props.instance.selectedTree.value) return

		const selectedTree = props.instance.selectedTree.value

		if (selectedTree.tree instanceof ObjectElement) {
			props.instance.edit(
				new AddPropertyEdit(selectedTree.tree, newValue, new ObjectElement(selectedTree.tree, newValue))
			)
		}

		if (selectedTree.tree instanceof ArrayElement) {
			props.instance.edit(
				new AddElementEdit(
					selectedTree.tree,
					new ValueElement(selectedTree.tree, selectedTree.tree.children.length, newValue)
				)
			)
		}

		await nextTick()

		_addValue.value = ''
	},
})

const editValue = computed<string>({
	get() {
		const selectedTree = props.instance.selectedTree.value

		if (!selectedTree) return ''

		if (selectedTree.type === 'property') {
			return selectedTree.tree.key as string
		} else {
			if (selectedTree.tree instanceof ValueElement) return selectedTree.tree.value?.toString() ?? 'null'
		}

		return ''
	},
	set(newValue) {
		const selectedTree = props.instance.selectedTree.value

		if (!selectedTree) return

		if (selectedTree.type === 'property') {
			props.instance.edit(
				new ModifyPropertyKeyEdit(
					selectedTree.tree.parent as ObjectElement,
					selectedTree.tree.key as string,
					newValue
				)
			)

			return
		} else {
			if (selectedTree.tree instanceof ValueElement) {
				props.instance.edit(new ModifyValueEdit(selectedTree.tree, newValue))

				return
			}
		}
	},
})

const rootElement: Ref<typeof TreeEditorPropertyElement> = <any>ref(null)

onMounted(() => {
	rootElement.value.open()

	props.instance.select(props.instance.tree.value)
})
</script>

<template>
	<div class="w-full h-full" ref="tabElement">
		<div class="h-full w-full flex flex-col" ref="editorContainer">
			<div class="w-full flex-1 overflow-auto">
				<TreeEditorPropertyElement :editor="instance" :tree="instance.tree.value" ref="rootElement" />
			</div>

			<div class="border-background-secondary border-t-2 w-full h-56 p-2">
				<div class="flex items-center gap-4 mt-3">
					<LabeledTextInput label="editors.treeEditor.add" v-model.lazy="addValue" class="flex-1 !mt-0" />

					<LabeledTextInput label="editors.treeEditor.edit" v-model.lazy="editValue" class="flex-1 !mt-0" />
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
