<script setup lang="ts">
import ActionContextMenuItem from '@/components/Common/ActionContextMenuItem.vue'
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'
import TreeEditorPropertyElement from './EditorElements/TreeEditorPropertyElement.vue'
import LabeledAutocompleteInput from '@/components/Common/LabeledAutocompleteInput.vue'
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'
import SubMenu from '@/components/Common/SubMenu.vue'

import { computed, nextTick, onMounted, Ref, ref } from 'vue'
import { type TreeEditorTab } from './TreeEditorTab'
import { ActionManager } from '@/libs/actions/ActionManager'
import { useTranslate } from '@/libs/locales/Locales'
import { AddElementEdit, AddPropertyEdit, ArrayElement, ModifyPropertyKeyEdit, ModifyValueEdit, ObjectElement, TreeElements, ValueElement } from './Tree'
import { CompletionItem } from '@/libs/jsonSchema/Schema'
import { Settings } from '@/libs/settings/Settings'

const t = useTranslate()

const props = defineProps<{ instance: TreeEditorTab }>()

const tabElement: Ref<HTMLDivElement | null> = ref(null)

const contextMenu: Ref<typeof FreeContextMenu | null> = ref(null)

function convertToMatchingType(value: string, types: string[]): any {
	if (types.includes('number') || (types.includes('integer') && /^-?([0-9]*[.])?[0-9]+$/.test(value))) {
		return parseFloat(value)
	}

	if (types.includes('boolean')) {
		if (value === 'true') return true

		if (value === 'false') return false
	}

	return value
}

const addValue = ref('')

async function addCompletion(completion: CompletionItem) {
	addValue.value = completion.value as string

	if (!props.instance.selectedTree.value) return

	const selectedTree = props.instance.selectedTree.value

	if (selectedTree.tree instanceof ObjectElement) {
		let value: TreeElements = new ObjectElement(selectedTree.tree, completion.value as string)

		if (Settings.get('bridgePredictions')) {
			const path = props.instance.getTreeSchemaPath(selectedTree.tree) + completion.value + '/'
			const types = props.instance.getTypes(path)
			if (types[0] === 'number') {
				value = new ValueElement(selectedTree.tree, completion.value as string, 1)
			} else if (types[0] === 'string') {
				value = new ValueElement(selectedTree.tree, completion.value as string, '')
			} else if (types[0] === 'integer') {
				value = new ValueElement(selectedTree.tree, completion.value as string, 1)
			} else if (types[0] === 'boolean') {
				value = new ValueElement(selectedTree.tree, completion.value as string, true)
			} else if (types[0] === 'array') {
				value = new ArrayElement(selectedTree.tree, completion.value as string)
			}
		}

		props.instance.edit(new AddPropertyEdit(selectedTree.tree, completion.value as string, value))
	}

	if (selectedTree.tree instanceof ArrayElement) {
		let value: any = completion.value

		if (Settings.get('bridgePredictions')) {
			const path = props.instance.getTreeSchemaPath(selectedTree.tree) + 'any_index/'
			const types = props.instance.getTypes(path)

			value = convertToMatchingType(completion.value as string, types)
		}

		props.instance.edit(new AddElementEdit(selectedTree.tree, new ValueElement(selectedTree.tree, selectedTree.tree.children.length, value)))
	}

	await nextTick()

	addValue.value = ''
}

async function addSubmit(value: string) {
	addValue.value = value

	if (!props.instance.selectedTree.value) return

	const selectedTree = props.instance.selectedTree.value

	if (selectedTree.tree instanceof ObjectElement) {
		let addValue: TreeElements = new ObjectElement(selectedTree.tree, value)

		if (Settings.get('bridgePredictions')) {
			const path = props.instance.getTreeSchemaPath(selectedTree.tree) + value + '/'
			const types = props.instance.getTypes(path)
			if (types[0] === 'number') {
				addValue = new ValueElement(selectedTree.tree, value, 1)
			} else if (types[0] === 'string') {
				addValue = new ValueElement(selectedTree.tree, value, '')
			} else if (types[0] === 'integer') {
				addValue = new ValueElement(selectedTree.tree, value, 1)
			} else if (types[0] === 'boolean') {
				addValue = new ValueElement(selectedTree.tree, value, true)
			} else if (types[0] === 'array') {
				addValue = new ArrayElement(selectedTree.tree, value)
			}
		}

		props.instance.edit(new AddPropertyEdit(selectedTree.tree, value, addValue))
	}

	if (selectedTree.tree instanceof ArrayElement) {
		let elementValue = value

		// TODO: If adding an object with a property with the same name as value is valid, add that instead
		if (Settings.get('bridgePredictions')) {
			const path = props.instance.getTreeSchemaPath(selectedTree.tree) + 'any_index/'
			const types = props.instance.getTypes(path)

			elementValue = convertToMatchingType(value, types)
		}

		props.instance.edit(new AddElementEdit(selectedTree.tree, new ValueElement(selectedTree.tree, selectedTree.tree.children.length, elementValue)))
	}

	await nextTick()

	addValue.value = ''
}

let justCompletedEdit = false

async function editCompletion(completion: CompletionItem) {
	justCompletedEdit = true

	const selectedTree = props.instance.selectedTree.value

	if (!selectedTree) return

	if (selectedTree.type === 'property') {
		props.instance.edit(new ModifyPropertyKeyEdit(selectedTree.tree.parent as ObjectElement, selectedTree.tree.key as string, completion.value as string))

		return
	} else {
		if (selectedTree.tree instanceof ValueElement) {
			props.instance.edit(new ModifyValueEdit(selectedTree.tree, completion.value as any))

			return
		}
	}
}

async function editSubmit(value: string) {
	const selectedTree = props.instance.selectedTree.value

	if (!selectedTree) return

	if (selectedTree.type === 'property') {
		props.instance.edit(new ModifyPropertyKeyEdit(selectedTree.tree.parent as ObjectElement, selectedTree.tree.key as string, value))

		return
	} else {
		if (selectedTree.tree instanceof ValueElement) {
			let elementValue = value

			if (Settings.get('bridgePredictions')) {
				const path = props.instance.getTreeSchemaPath(selectedTree.tree)
				const types = props.instance.getTypes(path)

				elementValue = convertToMatchingType(value, types)
			}

			props.instance.edit(new ModifyValueEdit(selectedTree.tree, elementValue))

			return
		}
	}
}

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
		if (justCompletedEdit) {
			justCompletedEdit = false

			return
		}

		editSubmit(newValue)
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
					path="/"
				/>
			</div>

			<div class="border-background-secondary border-t-2 w-full h-56 p-2">
				<div class="flex items-center gap-4 mt-3">
					<LabeledAutocompleteInput
						v-if="instance.selectedTree.value && !(instance.selectedTree.value.tree instanceof ValueElement)"
						label="editors.treeEditor.add"
						:completions="instance.completions.value"
						v-model="addValue"
						class="flex-1 !mt-0"
						@complete="addCompletion"
						@submit="addSubmit"
					/>

					<LabeledAutocompleteInput
						v-if="instance.selectedTree.value && (instance.selectedTree.value.type === 'property' || instance.selectedTree.value.tree instanceof ValueElement)"
						label="editors.treeEditor.edit"
						:completions="instance.selectedTree.value?.type === 'property' ? instance.parentCompletions.value : instance.completions.value"
						v-model="editValue"
						class="flex-1 !mt-0"
						@complete="editCompletion"
						@submit="editSubmit"
						:update-always="true"
					/>
				</div>
			</div>
		</div>

		<FreeContextMenu class="w-56" ref="contextMenu" #default="{ close }" @close="instance.contextTree.value = null">
			<ActionContextMenuItem
				v-if="instance.contextTree.value"
				action="treeEditor.copy"
				@click="
					() => {
						ActionManager.trigger('treeEditor.copy', undefined)
						close()
					}
				"
			/>

			<ActionContextMenuItem
				v-if="instance.contextTree.value"
				action="treeEditor.cut"
				@click="
					() => {
						ActionManager.trigger('treeEditor.cut', undefined)
						close()
					}
				"
			/>

			<ActionContextMenuItem
				v-if="instance.contextTree.value"
				action="treeEditor.paste"
				@click="
					() => {
						ActionManager.trigger('treeEditor.paste', undefined)
						close()
					}
				"
			/>

			<div v-if="instance.contextTree.value" class="bg-background-tertiary h-px m-2 my-0" />

			<ActionContextMenuItem
				v-if="instance.contextTree.value"
				action="treeEditor.delete"
				@click="
					() => {
						ActionManager.trigger('treeEditor.delete', undefined)
						close()
					}
				"
			/>

			<ActionContextMenuItem
				v-if="instance.contextTree.value"
				action="treeEditor.convert"
				@click="
					() => {
						ActionManager.trigger('treeEditor.convert', undefined)
						close()
					}
				"
			/>

			<SubMenu>
				<template #main="slotProps">
					<ContextMenuItem icon="swap_horiz" text="Convert" @mouseenter="slotProps.show" @mouseleave="slotProps.hide" />
				</template>

				<template #menu="">
					<ActionContextMenuItem
						action="treeEditor.convertToObject"
						@click="
							() => {
								ActionManager.trigger('treeEditor.convertToObject')
								close()
							}
						"
					/>

					<ActionContextMenuItem
						action="treeEditor.convertToArray"
						@click="
							() => {
								ActionManager.trigger('treeEditor.convertToArray')
								close()
							}
						"
					/>

					<ActionContextMenuItem
						action="treeEditor.convertToNull"
						@click="
							() => {
								ActionManager.trigger('treeEditor.convertToNull')
								close()
							}
						"
					/>

					<ActionContextMenuItem
						action="treeEditor.convertToNumber"
						@click="
							() => {
								ActionManager.trigger('treeEditor.convertToNumber')
								close()
							}
						"
					/>

					<ActionContextMenuItem
						action="treeEditor.convertToString"
						@click="
							() => {
								ActionManager.trigger('treeEditor.convertToString')
								close()
							}
						"
					/>

					<ActionContextMenuItem
						action="treeEditor.convertToBoolean"
						@click="
							() => {
								ActionManager.trigger('treeEditor.convertToBoolean')
								close()
							}
						"
					/>
				</template>
			</SubMenu>

			<div v-if="instance.contextTree.value" class="bg-background-tertiary h-px m-2 my-0" />

			<ActionContextMenuItem
				action="treeEditor.save"
				@click="
					() => {
						ActionManager.trigger('treeEditor.save', undefined)
						close()
					}
				"
			/>

			<div class="bg-background-tertiary h-px m-2 my-0" />

			<ActionContextMenuItem
				action="treeEditor.viewDocumentation"
				@click="
					() => {
						ActionManager.trigger('treeEditor.viewDocumentation', undefined)
						close()
					}
				"
			/>
		</FreeContextMenu>
	</div>
</template>
