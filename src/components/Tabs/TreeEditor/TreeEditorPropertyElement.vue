<script lang="ts" setup>
import Icon from '@/components/Common/Icon.vue'
import TreeEditorValueElement from './TreeEditorValueElement.vue'
import TreeEditorObjectElement from './TreeEditorContainerElement.vue'
import HighlightedText from './HighlightedText.vue'

import { ref } from 'vue'
import { TreeEditorTab } from './TreeEditorTab'
import { TreeElement, ObjectElement, ArrayElement } from './Tree'

const props = defineProps<{ tree: TreeElement; elementKey: string | number; editor: TreeEditorTab }>()

const open = ref(false)

const selected = props.editor.useIsSelected(props.tree.parent!, props.elementKey)

function click() {
	props.editor.select(props.tree.parent!, props.elementKey)

	if (!(props.tree instanceof ObjectElement || props.tree instanceof ArrayElement)) return

	open.value = !open.value
}
</script>

<template>
	<div class="table">
		<span class="flex items-end">
			<span
				class="flex items-center gap-1 bg-[var(--color)] hover:bg-background-secondary px-1 rounded transition-colors ease-out duration-100 cursor-pointer"
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
			<span v-else class="select-none">{</span>
		</span>
	</div>

	<div v-if="open">
		<div class="ml-4">
			<TreeEditorObjectElement :editor="editor" :tree="tree" />
		</div>

		<span class="ml-2 select-none">}</span>
	</div>
</template>
