<script setup lang="ts">
import ActionContextMenuItem from '@/components/Common/ActionContextMenuItem.vue'
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'
import TreeEditorPropertyElement from './EditorElements/TreeEditorPropertyElement.vue'
import LabeledTextInput from '@/components/Common/LabeledTextInput.vue'
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'
import SubMenu from '@/components/Common/SubMenu.vue'

import { computed, nextTick, onMounted, Ref, ref, watch } from 'vue'
import { type TreeEditorTab } from './TreeEditorTab'
import { ActionManager } from '@/libs/actions/ActionManager'
import { useTranslate } from '@/libs/locales/Locales'
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
	<div
		class="w-full h-full"
		ref="tabElement"
		@contextmenu.prevent="
			(event) => {
				instance.contextTree.value = null
				contextMenu?.open(event)
			}
		"
	>
		<div class="h-full w-full flex flex-col" ref="editorContainer">
			<div class="w-full flex-1 overflow-auto">
				<TreeEditorPropertyElement
					:editor="instance"
					:tree="instance.tree.value"
					ref="rootElement"
					@opencontextmenu="
						({ selection, event }) => {
							instance.contextTree.value = selection
							contextMenu?.open(event)
						}
					"
					path=""
				/>
			</div>

			<div class="border-background-secondary border-t-2 w-full h-56 p-2">
				<div class="flex items-center gap-4 mt-3">
					<LabeledTextInput label="editors.treeEditor.add" v-model.lazy="addValue" class="flex-1 !mt-0" />

					<LabeledTextInput label="editors.treeEditor.edit" v-model.lazy="editValue" class="flex-1 !mt-0" />
				</div>
			</div>
		</div>

		<FreeContextMenu class="w-56" ref="contextMenu" #default="{ close }" @close="instance.contextTree.value = null">
			<ActionContextMenuItem
				v-if="instance.contextTree.value"
				action="copy"
				@click="
					() => {
						ActionManager.trigger('copy', undefined)
						close()
					}
				"
			/>

			<ActionContextMenuItem
				v-if="instance.contextTree.value"
				action="cut"
				@click="
					() => {
						ActionManager.trigger('cut', undefined)
						close()
					}
				"
			/>

			<ActionContextMenuItem
				v-if="instance.contextTree.value"
				action="paste"
				@click="
					() => {
						ActionManager.trigger('paste', undefined)
						close()
					}
				"
			/>

			<div v-if="instance.contextTree.value" class="bg-background-tertiary h-px m-2 my-0" />

			<ActionContextMenuItem
				v-if="instance.contextTree.value"
				action="delete"
				@click="
					() => {
						ActionManager.trigger('delete', undefined)
						close()
					}
				"
			/>

			<ActionContextMenuItem
				v-if="instance.contextTree.value"
				action="convert"
				@click="
					() => {
						ActionManager.trigger('convert', undefined)
						close()
					}
				"
			/>

			<SubMenu>
				<template #main="slotProps">
					<ContextMenuItem
						icon="swap_horiz"
						text="Convert"
						@mouseenter="slotProps.show"
						@mouseleave="slotProps.hide"
					/>
				</template>

				<template #menu="">
					<ActionContextMenuItem
						action="convertToObject"
						@click="
							() => {
								ActionManager.trigger('convertToObject')
								close()
							}
						"
					/>

					<ActionContextMenuItem
						action="convertToArray"
						@click="
							() => {
								ActionManager.trigger('convertToArray')
								close()
							}
						"
					/>

					<ActionContextMenuItem
						action="convertToNull"
						@click="
							() => {
								ActionManager.trigger('convertToNull')
								close()
							}
						"
					/>

					<ActionContextMenuItem
						action="convertToNumber"
						@click="
							() => {
								ActionManager.trigger('convertToNumber')
								close()
							}
						"
					/>

					<ActionContextMenuItem
						action="convertToString"
						@click="
							() => {
								ActionManager.trigger('convertToString')
								close()
							}
						"
					/>
				</template>
			</SubMenu>

			<div v-if="instance.contextTree.value" class="bg-background-tertiary h-px m-2 my-0" />

			<ActionContextMenuItem
				action="save"
				@click="
					() => {
						ActionManager.trigger('save', undefined)
						close()
					}
				"
			/>

			<div class="bg-background-tertiary h-px m-2 my-0" />

			<ActionContextMenuItem
				action="viewDocumentation"
				@click="
					() => {
						ActionManager.trigger('viewDocumentation', undefined)
						close()
					}
				"
			/>
		</FreeContextMenu>
	</div>
</template>
