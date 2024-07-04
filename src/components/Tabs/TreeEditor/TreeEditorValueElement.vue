<script lang="ts" setup>
import HighlightedText from './HighlightedText.vue'
import { ObjectElement, TreeElement, ValueElement } from './Tree'
import { TreeEditorTab } from './TreeEditorTab'

const { tree, editor }: { tree: TreeElement; editor: TreeEditorTab } = <any>defineProps({
	editor: {
		required: true,
	},
	tree: {
		type: TreeElement,
		required: true,
	},
})

const emit = defineEmits(['click'])

function click(event: Event) {
	if (tree instanceof ObjectElement) emit('click')
}

function select(event: Event) {
	editor.select(tree)
}

const selected = editor.useIsSelected(tree)
</script>

<template>
	<span
		class="bg-[var(--color)] hover:bg-background-secondary px-1 rounded transition-colors ease-out duration-100 cursor-pointer"
		@click.stop="click"
		:style="{
			'--color': selected ? 'var(--theme-color-backgroundSecondary)' : 'none',
		}"
	>
		<span v-if="tree instanceof ObjectElement" class="select-none" :style="{ fontFamily: 'Consolas' }">{{
			Object.keys(tree.children).length === 0 ? '{}' : '{...}'
		}}</span>

		<span
			v-else-if="tree instanceof ValueElement && typeof tree.value === 'string'"
			class="select-none"
			:style="{ fontFamily: 'Consolas' }"
			@click.stop="select"
		>
			"<HighlightedText :known-words="editor.knownWords" :value="tree.value" type="string" />"
		</span>

		<span
			v-else-if="tree instanceof ValueElement"
			class="select-none"
			:style="{ fontFamily: 'Consolas' }"
			@click.stop="select"
		>
			<HighlightedText
				:known-words="editor.knownWords"
				:value="tree.value === null ? 'null' : tree.value.toString()"
				:type="typeof tree.value"
			/>
		</span>
	</span>
</template>
