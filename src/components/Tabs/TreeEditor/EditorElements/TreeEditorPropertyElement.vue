<script lang="ts" setup>
import Icon from '@/components/Common/Icon.vue'
import TreeEditorValueElement from './TreeEditorValueElement.vue'
import TreeEditorObjectElement from './TreeEditorContainerElement.vue'
import HighlightedText from '../HighlightedText.vue'

import { computed, nextTick, Ref, ref } from 'vue'
import { TreeEditorTab } from '../TreeEditorTab'
import { TreeElement, ObjectElement, ArrayElement, MovePropertyKeyEdit } from '../Tree'

const props = defineProps<{
	tree: TreeElement
	elementKey: string | number
	editor: TreeEditorTab
	preview?: boolean
}>()

const open = ref(false)

//Proxies don't equal eachother so we use an uuid
const selected = computed(
	() =>
		props.editor.selectedTree.value?.tree.id === props.tree.parent?.id &&
		props.editor.selectedTree.value?.key === props.elementKey
)

const dragging = computed(
	() =>
		props.editor.draggedTree.value?.tree.id === props.tree.parent?.id &&
		props.editor.draggedTree.value?.key === props.elementKey
)

function click() {
	props.editor.select(props.tree.parent!, props.elementKey)

	if (!(props.tree instanceof ObjectElement || props.tree instanceof ArrayElement)) return

	open.value = !open.value
}

const propertyElement: Ref<HTMLDivElement> = <any>ref(null)

const draggingCount = ref(0)
const draggingOver = computed(() => draggingCount.value > 0)
const draggingAbove = ref(true)

function dragStart(event: DragEvent) {
	if (props.preview) return

	if (event.target !== propertyElement.value) return

	requestAnimationFrame(() => {
		props.editor.drag(props.tree.parent!, props.elementKey)
	})
}

function dragEnd(event: DragEvent) {
	if (props.preview) return

	if (event.target !== propertyElement.value) return

	props.editor.cancelDrag()
}

function dragEnter(event: DragEvent) {
	event.preventDefault()

	if (props.preview) return

	draggingCount.value++

	event.stopPropagation()
}

function dragLeave(event: DragEvent) {
	event.preventDefault()

	if (props.preview) return

	draggingCount.value--

	event.stopPropagation()
}

function dragOver(event: DragEvent) {
	event.preventDefault()

	if (props.preview) return

	draggingAbove.value =
		event.clientY <
		propertyElement.value.getBoundingClientRect().top + propertyElement.value.getBoundingClientRect().height / 2

	event.stopPropagation()
}

function drop(event: DragEvent) {
	if (props.preview) return

	draggingCount.value = 0

	const draggedTree = props.editor.draggedTree.value

	event.stopPropagation()

	if (!draggedTree) return
	if (!(draggedTree.tree instanceof ObjectElement)) return
	if (!(props.tree instanceof ObjectElement)) return
	if (!(typeof draggedTree.key === 'string')) return
	if (!(typeof props.elementKey === 'string')) return

	props.editor.edit(
		new MovePropertyKeyEdit(
			draggedTree.tree,
			draggedTree.key,
			props.tree.parent as ObjectElement,
			Object.keys((props.tree.parent as ObjectElement).children)
				.filter((key) => key !== draggedTree.key)
				.indexOf(props.elementKey) + (draggingAbove.value ? 0 : 1)
		)
	)
	props.editor.cancelDrag()
}
</script>

<template>
	<div
		v-show="preview || !dragging"
		class="table relative w-full"
		draggable="true"
		ref="propertyElement"
		@drag=""
		@dragstart="dragStart"
		@dragend="dragEnd"
		@dragenter="dragEnter"
		@dragleave="dragLeave"
		@dragover="dragOver"
		@drop="drop"
	>
		<TreeEditorPropertyElement
			v-if="!preview && draggingOver && draggingAbove && editor.draggedTree.value !== null"
			:tree="editor.draggedTree.value.tree"
			:elementKey="editor.draggedTree.value.key!"
			:editor="editor"
			:preview="true"
		/>

		<span class="flex items-end">
			<span
				class="flex items-center gap-1 bg-[var(--color)] px-1 rounded transition-colors ease-out duration-100 cursor-pointer"
				:class="{ 'hover:bg-background-secondary': !editor.draggedTree.value || dragging }"
				@click="click"
				:style="{
					'--color': selected ? 'var(--theme-color-backgroundSecondary)' : 'none',
				}"
			>
				<Icon
					icon="chevron_right"
					class="text-base transition-rotate ease-out duration-100"
					:style="{
						rotate: open ? '90deg' : 'none',
					}"
					:color="tree instanceof ObjectElement || tree instanceof ArrayElement ? 'text' : 'textSecondary'"
				/>

				<span v-if="typeof elementKey === 'string'" class="select-none" :style="{ fontFamily: 'Consolas' }">
					"<HighlightedText
						:known-words="(editor as TreeEditorTab).knownWords"
						:value="elementKey"
						type="string"
					/>":
				</span>
			</span>

			<TreeEditorValueElement v-if="!open" :editor="editor" :tree="tree" @click="click" />

			<span v-else class="select-none px-1" :style="{ fontFamily: 'Consolas' }">{{
				tree instanceof ObjectElement ? '{' : '['
			}}</span>
		</span>

		<div v-if="open">
			<div class="ml-4">
				<TreeEditorObjectElement :editor="editor" :tree="tree" />
			</div>

			<span class="ml-2 select-none px-1" :style="{ fontFamily: 'Consolas' }">{{
				tree instanceof ObjectElement ? '}' : ']'
			}}</span>
		</div>

		<TreeEditorPropertyElement
			v-if="!preview && draggingOver && !draggingAbove && editor.draggedTree.value !== null"
			:tree="editor.draggedTree.value.tree"
			:elementKey="editor.draggedTree.value.key!"
			:editor="editor"
			:preview="true"
		/>
	</div>
</template>
