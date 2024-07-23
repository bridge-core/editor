<script lang="ts" setup>
import Icon from '@/components/Common/Icon.vue'
import TreeEditorValueElement from './TreeEditorValueElement.vue'
import TreeEditorObjectElement from './TreeEditorContainerElement.vue'
import HighlightedText from '../HighlightedText.vue'

import { computed, onMounted, Ref, ref } from 'vue'
import { TreeEditorTab } from '../TreeEditorTab'
import { TreeElements, ObjectElement, ArrayElement, MovePropertyKeyEdit } from '../Tree'

const props = defineProps<{
	tree: TreeElements
	elementKey?: string | number | null
	editor: TreeEditorTab
	preview?: boolean
}>()

const isOpen = ref(false)

//Proxies don't equal eachother so we use an uuid
const propertySelected = computed(
	() =>
		props.editor.selectedTree.value &&
		props.editor.selectedTree.value.type === 'property' &&
		props.editor.selectedTree.value.tree.id === props.tree.id
)

const dragging = computed(
	() => props.editor.draggedTree.value && props.editor.draggedTree.value.tree.id === props.tree.id
)

function clickProperty() {
	props.editor.selectProperty(props.tree)

	if (!(props.tree instanceof ObjectElement || props.tree instanceof ArrayElement)) return

	isOpen.value = true
}

function clickValue() {
	if (!(props.tree instanceof ObjectElement || props.tree instanceof ArrayElement)) return

	isOpen.value = true
}

function toggleOpen() {
	if (!(props.tree instanceof ObjectElement || props.tree instanceof ArrayElement)) return

	isOpen.value = !isOpen.value
}

const propertyElement: Ref<HTMLDivElement> = <any>ref(null)

const draggingCount = ref(0)
const draggingOver = computed(() => draggingCount.value > 0)
const draggingAbove = ref(true)

function dragStart(event: DragEvent) {
	if (props.preview) return

	if (event.target !== propertyElement.value) return

	requestAnimationFrame(() => {
		props.editor.drag(props.tree)
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
	if (!(props.tree.parent instanceof ObjectElement)) return
	if (!(typeof draggedTree.tree.key === 'string')) return
	if (!(typeof props.elementKey === 'string')) return

	props.editor.edit(
		new MovePropertyKeyEdit(
			draggedTree.tree,
			props.tree.parent as ObjectElement,
			Object.keys((props.tree.parent as ObjectElement).children)
				.filter((key) => key !== draggedTree.tree.key)
				.indexOf(props.elementKey) + (draggingAbove.value ? 0 : 1)
		)
	)
	props.editor.cancelDrag()
}

function open() {
	if (!(props.tree instanceof ObjectElement || props.tree instanceof ArrayElement)) return

	isOpen.value = true
}
defineExpose({ open })
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
			v-if="!preview && draggingOver && editor.draggedTree.value !== null"
			v-show="draggingAbove"
			:tree="editor.draggedTree.value.tree"
			:elementKey="typeof elementKey === 'string' ? editor.draggedTree.value.tree.key : -1"
			:editor="editor"
			:preview="true"
		/>

		<span class="flex items-end">
			<span
				class="flex items-center gap-1 bg-[var(--color)] px-1 rounded transition-colors ease-out duration-100 cursor-pointer"
				:class="{ 'hover:bg-background-secondary': !editor.draggedTree.value || dragging }"
				@click="clickProperty"
				:style="{
					'--color': propertySelected ? 'var(--theme-color-backgroundSecondary)' : 'none',
				}"
			>
				<Icon
					icon="chevron_right"
					class="text-base transition-rotate ease-out duration-100"
					:style="{
						rotate: isOpen ? '90deg' : 'none',
					}"
					:color="tree instanceof ObjectElement || tree instanceof ArrayElement ? 'text' : 'textSecondary'"
					@click.stop="toggleOpen"
				/>

				<span v-if="typeof elementKey === 'string'" class="select-none" :style="{ fontFamily: 'Consolas' }">
					"<HighlightedText
						:known-words="(editor as TreeEditorTab).knownWords"
						:value="elementKey"
						type="string"
					/>":
				</span>
			</span>

			<TreeEditorValueElement v-if="!isOpen" :editor="editor" :tree="tree" @click="clickValue" />

			<span
				v-else
				class="select-none px-1"
				:style="{
					fontFamily: 'Consolas',
				}"
				>{{ tree instanceof ObjectElement ? '{' : '[' }}</span
			>
		</span>

		<div v-if="isOpen">
			<div class="ml-4">
				<TreeEditorObjectElement :editor="editor" :tree="tree" />
			</div>

			<span
				class="ml-2 select-none px-1"
				:style="{
					fontFamily: 'Consolas',
				}"
				>{{ tree instanceof ObjectElement ? '}' : ']' }}</span
			>
		</div>

		<TreeEditorPropertyElement
			v-if="!preview && draggingOver && editor.draggedTree.value !== null"
			v-show="!draggingAbove"
			:tree="editor.draggedTree.value.tree"
			:elementKey="typeof elementKey === 'string' ? editor.draggedTree.value.tree.key : -1"
			:editor="editor"
			:preview="true"
		/>
	</div>
</template>
