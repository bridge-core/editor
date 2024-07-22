<script lang="ts" setup>
import { computed } from 'vue'
import HighlightedText from '../HighlightedText.vue'
import { ArrayElement, ObjectElement, TreeElement, ValueElement } from '../Tree'
import { TreeEditorTab } from '../TreeEditorTab'

const props = defineProps<{ tree: TreeElement; editor: TreeEditorTab }>()

const emit = defineEmits(['click'])

function click(event: Event) {
	if (props.tree instanceof ObjectElement || props.tree instanceof ArrayElement) emit('click')
}

function select(event: Event) {
	props.editor.select(props.tree)
}

//Proxies don't equal eachother so we use an uuid
const selected = computed(() => props.editor.selectedTree.value && props.editor.selectedTree.value.id === props.tree.id)

const value = computed(() => (props.tree instanceof ValueElement ? props.tree.value : null))
</script>

<template>
	<span
		class="bg-[var(--color)] hover:bg-background-secondary px-1 rounded transition-colors ease-out duration-100 cursor-pointer"
		@click.stop="click"
		:style="{
			'--color': selected ? 'var(--theme-color-backgroundSecondary)' : 'none',
		}"
	>
		<span v-if="tree instanceof ObjectElement" class="select-none flex" :style="{ fontFamily: 'Consolas' }">{{
			Object.keys(tree.children).length === 0 ? '{}' : '{...}'
		}}</span>

		<span v-else-if="tree instanceof ArrayElement" class="select-none flex" :style="{ fontFamily: 'Consolas' }">{{
			tree.children.length === 0 ? '[]' : '[...]'
		}}</span>

		<span
			v-else-if="tree instanceof ValueElement && typeof value === 'string'"
			class="select-none"
			:style="{ fontFamily: 'Consolas' }"
			@click.stop="select"
		>
			"<HighlightedText :known-words="editor.knownWords" :value="value" type="string" />"
		</span>

		<span
			v-else-if="tree instanceof ValueElement"
			class="select-none"
			:style="{ fontFamily: 'Consolas' }"
			@click.stop="select"
		>
			<HighlightedText
				:known-words="editor.knownWords"
				:value="value === null ? 'null' : value.toString()"
				:type="typeof value"
			/>
		</span>
	</span>
</template>
