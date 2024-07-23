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
import { AddPropertyEdit, ModifyPropertyKeyEdit, ModifyValueEdit, ObjectElement, ValueElement } from './Tree'

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

		if (!(selectedTree instanceof ObjectElement)) return

		props.instance.edit(
			new AddPropertyEdit(selectedTree as ObjectElement, newValue, new ObjectElement(selectedTree))
		)

		await nextTick()

		_addValue.value = ''
	},
})

const editValue = computed<string>({
	get() {
		const selectedTree = props.instance.selectedTree.value

		if (!selectedTree) return ''

		if (selectedTree instanceof ValueElement) return selectedTree.value?.toString() ?? 'null'

		if (selectedTree instanceof ObjectElement) return selectedTree.key?.toString() ?? ''

		return ''
	},
	set(newValue) {
		if (!props.instance.selectedTree.value) return

		if (props.instance.selectedTree.value instanceof ValueElement) {
			props.instance.edit(new ModifyValueEdit(props.instance.selectedTree.value, newValue))

			return
		}

		const key = props.instance.selectedTree.value.tree.key

		if (!key) return

		if (props.instance.selectedTree.value instanceof ObjectElement) {
			props.instance.edit(new ModifyPropertyKeyEdit(props.instance.selectedTree.value, <string>key, newValue))

			return
		}
	},
})

const rootElement: Ref<typeof TreeEditorPropertyElement> = <any>ref(null)

onMounted(() => {
	rootElement.value.open()
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
					<LabeledTextInput label="Add" v-model.lazy="addValue" class="flex-1 !mt-0" />

					<TextButton text="abc" />

					<LabeledTextInput label="Edit" v-model.lazy="editValue" class="flex-1 !mt-0" />
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
