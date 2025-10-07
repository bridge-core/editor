<script lang="ts" setup>
import Icon from '@/components/Common/Icon.vue'
import TreeEditorValueElement from './TreeEditorValueElement.vue'
import TreeEditorObjectElement from './TreeEditorContainerElement.vue'
import HighlightedText from '../HighlightedText.vue'

import { computed, onMounted, Ref, ref } from 'vue'
import { TreeEditorTab } from '../TreeEditorTab'
import { TreeElements, ObjectElement, ArrayElement, MoveEdit } from '../Tree'
import { Settings } from '@/libs/settings/Settings'

const get = Settings.useGet()

const props = defineProps<{
	tree: TreeElements
	elementKey?: string | number | null
	editor: TreeEditorTab
	preview?: boolean
	path: string
}>()

const emit = defineEmits(['opencontextmenu'])

const isOpen = ref(false)

//Proxies don't equal eachother so we use an uuid
const propertySelected = computed(
	() =>
		props.editor.selectedTree.value &&
		props.editor.selectedTree.value.type === 'property' &&
		props.editor.selectedTree.value.tree.id === props.tree.id
)

const valueSelected = computed(
	() =>
		props.editor.selectedTree.value &&
		props.editor.selectedTree.value.type === 'value' &&
		props.editor.selectedTree.value.tree.id === props.tree.id
)

const dragging = computed(() => props.editor.draggedTree.value && props.editor.draggedTree.value.tree.id === props.tree.id)

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
const draggingInside = ref(false)

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

	const y = event.clientY
	const boundingRect = propertyElement.value.getBoundingClientRect()
	const minY = boundingRect.top
	const height = boundingRect.height

	draggingInside.value = false

	const empty =
		(props.tree instanceof ObjectElement && Object.keys(props.tree.children).length === 0) ||
		(props.tree instanceof ArrayElement && props.tree.children.length === 0)

	if (isOpen.value && empty) {
		if (y < minY + 16 || y > minY + height - 16) {
			draggingAbove.value = y < minY + height / 2
		} else {
			draggingInside.value = true
		}
	} else {
		draggingAbove.value = y < minY + height / 2
	}
}

function drop(event: DragEvent) {
	if (props.preview) return

	draggingCount.value = 0

	const draggedTree = props.editor.draggedTree.value

	event.stopPropagation()

	if (!draggedTree) return

	if (draggingInside.value) {
		if (!(props.tree instanceof ObjectElement) && !(props.tree instanceof ArrayElement)) return

		if (props.tree.id === draggedTree.tree.parent?.id) return

		props.editor.edit(new MoveEdit(draggedTree.tree, props.tree, 0))
	} else {
		if (props.tree.parent?.id === draggedTree.tree.parent?.id) return

		if (props.tree.parent instanceof ObjectElement) {
			let keys = Object.keys(props.tree.parent.children)

			if (draggedTree.tree.parent!.id === props.tree.parent.id) keys = keys.filter((key) => key !== draggedTree.tree.key)

			props.editor.edit(
				new MoveEdit(draggedTree.tree, props.tree.parent, keys.indexOf(props.elementKey as string) + (draggingAbove.value ? 0 : 1))
			)
		} else if (props.tree.parent instanceof ArrayElement) {
			let values = props.tree.parent.children

			if (draggedTree.tree.parent === props.tree.parent) values = values.filter((value) => value.id !== draggedTree.tree.id)

			props.editor.edit(
				new MoveEdit(
					draggedTree.tree,
					props.tree.parent,
					values.findIndex((value) => value.id === props.tree.id) + (draggingAbove.value ? 0 : 1)
				)
			)
		} else {
			return
		}
	}

	props.editor.cancelDrag()
}

const diagnostic = computed(() => props.editor.diagnostics.value.find((diagnostic) => diagnostic.path === props.path))

const hasChildDiagnostic = computed(() =>
	props.editor.diagnostics.value.find((diagnostic) => diagnostic.path.startsWith(props.path) && diagnostic.path !== props.path)
)

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
			v-show="draggingAbove && !draggingInside"
			:tree="editor.draggedTree.value.tree"
			:elementKey="typeof elementKey === 'string' ? editor.draggedTree.value.tree.key : -1"
			:editor="editor"
			:preview="true"
			:path
		/>

		<p v-if="diagnostic" class="ml-6 text-xs text-warning font-theme opacity-60">
			<Icon icon="arrow_downward" color="warning" class="text-xs" /> {{ diagnostic.message }}
		</p>

		<span class="flex">
			<span
				class="flex items-center gap-1 bg-[var(--color)] px-1 rounded transition-colors ease-out duration-100 cursor-pointer"
				:class="{ 'hover:bg-background-secondary': !editor.draggedTree.value || dragging }"
				:style="{
					'--color': propertySelected ? 'var(--theme-color-backgroundSecondary)' : 'none',
				}"
				@click="typeof elementKey === 'string' ? clickProperty() : undefined"
				@contextmenu.stop.prevent="
					typeof elementKey === 'string'
						? (event: MouseEvent) => emit('opencontextmenu', { selection: { type: 'property', tree }, event })
						: undefined
				"
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

				<span
					v-if="typeof elementKey === 'string' || (typeof elementKey === 'number' && get('showArrayIndices'))"
					class="select-none font-theme-editor text-theme-editor"
				>
					{{ typeof elementKey === 'string' ? '"' : '' }}
					<HighlightedText
						:known-words="(editor as TreeEditorTab).knownWords"
						:value="elementKey.toString()"
						:type="typeof elementKey"
					/>
					{{ typeof elementKey === 'string' ? '"' : '' }}
					:
				</span>
			</span>

			<TreeEditorValueElement
				v-if="!isOpen"
				:editor="editor"
				:tree="tree"
				@click="clickValue"
				@opencontextmenu="(event) => emit('opencontextmenu', event)"
				:path
			/>

			<span
				v-else
				class="select-none px-1 bg-[var(--color)] hover:bg-background-secondary rounded transition-colors ease-out duration-100 cursor-pointer font-theme-editor text-theme-editor"
				:style="{
					'--color': valueSelected ? 'var(--theme-color-backgroundSecondary)' : 'none',
				}"
				@click="editor.select(tree)"
				@contextmenu.stop.prevent="(event: MouseEvent) => emit('opencontextmenu', {selection: { type: 'value', tree }, event})"
				>{{ tree instanceof ObjectElement ? '{' : '[' }}</span
			>

			<Icon v-if="!isOpen && hasChildDiagnostic" icon="error" color="warning" class="text-base" />
		</span>

		<div v-if="isOpen">
			<div class="ml-4">
				<TreeEditorPropertyElement
					v-if="!preview && draggingOver && editor.draggedTree.value !== null"
					v-show="draggingInside"
					:tree="editor.draggedTree.value.tree"
					:elementKey="typeof elementKey === 'string' ? editor.draggedTree.value.tree.key : -1"
					:editor="editor"
					:preview="true"
					:path
				/>

				<TreeEditorObjectElement :editor="editor" :tree="tree" @opencontextmenu="(event) => emit('opencontextmenu', event)" :path />
			</div>

			<span
				class="select-none px-1 bg-[var(--color)] hover:bg-background-secondary rounded transition-colors ease-out duration-100 cursor-pointer font-theme-editor text-theme-editor inline-block min-h-[1.5rem]"
				:style="{
					'--color': valueSelected ? 'var(--theme-color-backgroundSecondary)' : 'none',
				}"
				@click="editor.select(tree)"
				@contextmenu.stop="(event: MouseEvent) => emit('opencontextmenu', {selection: { type: 'value', tree }, event})"
				>{{ tree instanceof ObjectElement ? '}' : ']' }}</span
			>
		</div>

		<TreeEditorPropertyElement
			v-if="!preview && draggingOver && editor.draggedTree.value !== null"
			v-show="!draggingAbove && !draggingInside"
			:tree="editor.draggedTree.value.tree"
			:elementKey="typeof elementKey === 'string' ? editor.draggedTree.value.tree.key : -1"
			:editor="editor"
			:preview="true"
			:path
		/>
	</div>
</template>
